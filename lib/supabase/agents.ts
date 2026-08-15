import { getSupabaseAdmin } from "@/lib/supabase/client";
import { preferredSlug, makeSlug } from "@/lib/agents/slug";
import type { AgentFileRecord, AgentKnowledge, AgentRecord, VoicePersonality } from "@/types";

export async function createAgentRecord(
  knowledge: AgentKnowledge,
  extras: { knowledgeText?: string; voice?: VoicePersonality; slugHint?: string; logo?: string },
): Promise<AgentRecord | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const now = new Date().toISOString();
  let slug = extras.slugHint || preferredSlug(knowledge.name);
  const { data: existing } = await supabase.from("agents").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = makeSlug(knowledge.name);

  const row = {
    slug,
    name: knowledge.name,
    category: knowledge.category,
    description: knowledge.description,
    location: knowledge.location,
    phone: knowledge.phone,
    email: knowledge.email,
    website: knowledge.website,
    opening_hours: knowledge.opening_hours,
    products: knowledge.products,
    services: knowledge.services,
    pricing: knowledge.pricing,
    faqs: knowledge.faqs,
    personality: knowledge.personality,
    knowledge: extras.knowledgeText || knowledge.additional_knowledge,
    voice: extras.voice || "friendly",
    logo: knowledge.logo || extras.logo || "",
    followers_count: 0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("agents").insert(row).select("*").single();
  if (error || !data) {
    console.error("createAgentRecord", error);
    return null;
  }
  return mapAgent(data);
}

export async function listAgents(limit = 12): Promise<AgentRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("agents").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data || []).map((row) => mapAgent(row as Record<string, unknown>));
}

export async function getAgentBySlug(slug: string): Promise<AgentRecord | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("agents").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapAgent(data);
}

export async function ensureAgentBySlug(agent: AgentRecord): Promise<AgentRecord | null> {
  const existing = await getAgentBySlug(agent.slug);
  if (existing) return existing;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      slug: agent.slug,
      name: agent.name,
      category: agent.category,
      description: agent.description,
      location: agent.location,
      phone: agent.phone,
      email: agent.email,
      website: agent.website,
      opening_hours: agent.opening_hours,
      products: agent.products,
      services: agent.services,
      pricing: agent.pricing,
      faqs: agent.faqs,
      personality: agent.personality,
      knowledge: agent.knowledge || agent.additional_knowledge,
      voice: agent.voice || "friendly",
      logo: agent.logo || "",
      followers_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return getAgentBySlug(agent.slug);
    console.error("ensureAgentBySlug", error);
    return null;
  }
  return data ? mapAgent(data as Record<string, unknown>) : null;
}

export async function updateAgentVoice(slug: string, voice: VoicePersonality) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("agents")
    .update({ voice, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapAgent(data);
}

export async function saveAgentFile(file: Omit<AgentFileRecord, "id" | "created_at">) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("agent_files")
    .insert({ ...file, created_at: new Date().toISOString() })
    .select("*")
    .single();
  if (error) {
    console.error("saveAgentFile", error);
    return null;
  }
  return data as AgentFileRecord;
}

export async function getAgentFiles(agentId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase.from("agent_files").select("*").eq("agent_id", agentId);
  return (data || []) as AgentFileRecord[];
}

export async function saveConversation(agentId: string, userMessage: string, assistantMessage: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("conversations").insert({
    agent_id: agentId,
    user_message: userMessage,
    assistant_message: assistantMessage,
    created_at: new Date().toISOString(),
  });
}

export async function uploadToStorage(path: string, bytes: Buffer, contentType: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { error } = await supabase.storage.from("agent-files").upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error("uploadToStorage", error);
    return null;
  }
  return path;
}

function mapAgent(data: Record<string, unknown>): AgentRecord {
  return {
    id: String(data.id),
    slug: String(data.slug),
    name: String(data.name || ""),
    category: String(data.category || ""),
    description: String(data.description || ""),
    location: String(data.location || ""),
    phone: String(data.phone || ""),
    email: String(data.email || ""),
    website: String(data.website || ""),
    opening_hours: String(data.opening_hours || ""),
    products: asStringArray(data.products),
    services: asStringArray(data.services),
    pricing: asStringArray(data.pricing),
    faqs: (Array.isArray(data.faqs) ? data.faqs : []) as AgentRecord["faqs"],
    important_information: [],
    personality: String(data.personality || ""),
    additional_knowledge: String(data.knowledge || ""),
    knowledge: String(data.knowledge || ""),
    voice: (data.voice as AgentRecord["voice"]) || "friendly",
    logo: String(data.logo || ""),
    followers_count: Number(data.followers_count || 0),
    created_at: String(data.created_at || ""),
    updated_at: String(data.updated_at || ""),
  };
}

export type FollowPerson = { key: string; name: string; created_at: string };

async function syncFollowerCount(agentId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("agent_follows")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agentId);
  const next = count || 0;
  await supabase.from("agents").update({ followers_count: next, updated_at: new Date().toISOString() }).eq("id", agentId);
  return next;
}

export async function followAgent(agentId: string, followerKey: string, displayName: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { error } = await supabase.from("agent_follows").insert({
    agent_id: agentId,
    follower_key: followerKey,
    display_name: displayName,
  });
  if (error && error.code !== "23505") {
    console.error("followAgent", error);
    return null;
  }
  const count = await syncFollowerCount(agentId);
  return { following: true, count };
}

export async function unfollowAgent(agentId: string, followerKey: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  await supabase.from("agent_follows").delete().eq("agent_id", agentId).eq("follower_key", followerKey);
  const count = await syncFollowerCount(agentId);
  return { following: false, count };
}

export async function getFollowState(agentId: string, followerKey?: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { count: 0, following: false, people: [] as FollowPerson[] };
  const [{ count }, peopleRes, followingRes] = await Promise.all([
    supabase.from("agent_follows").select("id", { count: "exact", head: true }).eq("agent_id", agentId),
    supabase
      .from("agent_follows")
      .select("follower_key, display_name, created_at")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(40),
    followerKey
      ? supabase.from("agent_follows").select("id").eq("agent_id", agentId).eq("follower_key", followerKey).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const people: FollowPerson[] = (peopleRes.data || []).map((row) => ({
    key: String(row.follower_key),
    name: String(row.display_name || "Guest"),
    created_at: String(row.created_at || ""),
  }));
  return { count: count || 0, following: Boolean(followingRes.data), people };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
}
