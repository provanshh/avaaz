import { NextResponse } from "next/server";
import { getFeaturedAgent, FEATURED_AGENTS } from "@/lib/featured-agents";
import { NOOR_JEWELS } from "@/lib/sample-agent";
import { extractFileText, isAllowedFile, MAX_FILE_BYTES, mimeFromName } from "@/lib/files/extract";
import { preferredSlug, makeSlug } from "@/lib/agents/slug";
import { getAgentBySlug, createAgentRecord, getAgentFiles, saveAgentFile, updateAgentVoice, uploadToStorage, listAgents } from "@/lib/supabase/agents";
import { agentLogoUrl } from "@/lib/logo";
import { enhanceFaqs } from "@/lib/agents/faqs";
import type { AgentKnowledge, AgentRecord, VoicePersonality } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    const agents = await listAgents(16);
    const seen = new Set(agents.map((a) => a.slug));
    const featured = FEATURED_AGENTS.filter((a) => !seen.has(a.slug));
    return NextResponse.json({ agents: [...featured, ...agents] });
  }
  const agent =
    (await getAgentBySlug(slug)) || getFeaturedAgent(slug) || (slug === "noor-jewels" ? NOOR_JEWELS : null);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const files = agent.id ? await getAgentFiles(agent.id) : [];
  return NextResponse.json({ agent, files });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { slug?: string; voice?: VoicePersonality };
  if (!body.slug || !body.voice) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const updated = await updateAgentVoice(body.slug, body.voice);
  return NextResponse.json({ agent: updated, local: !updated });
}

export async function POST(req: Request) {
  const form = await req.formData();
  const raw = String(form.get("payload") || "{}");
  const payload = JSON.parse(raw) as {
    knowledge: AgentKnowledge;
    voice?: VoicePersonality;
    files?: { name: string; type: string; extractedText: string }[];
  };

  const knowledge = payload.knowledge;
  knowledge.logo =
    knowledge.logo ||
    agentLogoUrl({ website: knowledge.website, name: knowledge.name });
  knowledge.faqs = enhanceFaqs({
    ...knowledge,
    products: knowledge.products || [],
    services: knowledge.services || [],
    pricing: knowledge.pricing || [],
    faqs: knowledge.faqs || [],
  });
  if (!knowledge?.name && !knowledge?.description && !knowledge?.additional_knowledge) {
    return NextResponse.json({ error: "Empty agent data. Go back and talk a little more." }, { status: 400 });
  }

  const extraFromClient = (payload.files || []).map((f) => `File: ${f.name}\n${f.extractedText}`).join("\n\n");
  let extraFromUploads = "";
  const extractedFiles: { name: string; type: string; extractedText: string; path: string }[] = [];

  const uploads = form.getAll("files");
  for (const item of uploads) {
    if (!(item instanceof File)) continue;
    if (item.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${item.name} is too large. Max 8MB.` }, { status: 400 });
    }
    if (!isAllowedFile(item.name, item.type)) {
      return NextResponse.json({ error: `${item.name} is unsupported. Use PDF, TXT, DOCX or CSV.` }, { status: 400 });
    }
    const bytes = Buffer.from(await item.arrayBuffer());
    try {
      const text = await extractFileText(item.name, item.type, bytes);
      extraFromUploads += `\n\nFile: ${item.name}\n${text}`;
      const path = `${Date.now()}-${item.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await uploadToStorage(path, bytes, item.type || mimeFromName(item.name));
      extractedFiles.push({
        name: item.name,
        type: item.type || mimeFromName(item.name),
        extractedText: text,
        path,
      });
    } catch {
      return NextResponse.json({ error: `Could not read ${item.name}.` }, { status: 400 });
    }
  }

  const knowledgeText = [knowledge.additional_knowledge, extraFromClient, extraFromUploads]
    .filter(Boolean)
    .join("\n\n");

  const created = await createAgentRecord(knowledge, {
    knowledgeText,
    voice: payload.voice || "friendly",
    slugHint: knowledge.name.toLowerCase().includes("noor") ? "noor-jewels" : preferredSlug(knowledge.name),
  });

  const now = new Date().toISOString();
  const agent: AgentRecord =
    created ||
    ({
      ...knowledge,
      id: crypto.randomUUID(),
      slug: knowledge.name.toLowerCase().includes("noor") ? "noor-jewels" : makeSlug(knowledge.name),
      knowledge: knowledgeText,
      additional_knowledge: knowledgeText,
      voice: payload.voice || "friendly",
      created_at: now,
      updated_at: now,
    } as AgentRecord);

  if (created) {
    for (const file of extractedFiles) {
      await saveAgentFile({
        agent_id: created.id,
        file_name: file.name,
        file_path: file.path,
        file_type: file.type,
        extracted_text: file.extractedText,
      });
    }
    for (const file of payload.files || []) {
      await saveAgentFile({
        agent_id: created.id,
        file_name: file.name,
        file_path: "",
        file_type: file.type,
        extracted_text: file.extractedText,
      });
    }
  }

  return NextResponse.json({
    agent,
    persisted: Boolean(created),
    files: [...extractedFiles.map((f) => f.name), ...(payload.files || []).map((f) => f.name)],
  });
}
