import { NextResponse } from "next/server";
import { getAgentBySlug, saveConversation } from "@/lib/supabase/agents";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    userMessage?: string;
    assistantMessage?: string;
  };
  if (!body.slug || !body.userMessage || !body.assistantMessage) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const agent = await getAgentBySlug(body.slug);
  if (agent) await saveConversation(agent.id, body.userMessage, body.assistantMessage);
  return NextResponse.json({ ok: true });
}
