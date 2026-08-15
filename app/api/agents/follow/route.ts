import { NextResponse } from "next/server";
import { ensureAgentBySlug, followAgent, getAgentBySlug, getFollowState, unfollowAgent } from "@/lib/supabase/agents";
import { getFeaturedAgent } from "@/lib/featured-agents";
import { NOOR_JEWELS } from "@/lib/sample-agent";
import type { AgentRecord } from "@/types";

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolvePersistedAgent(slug: string): Promise<AgentRecord | null> {
  const existing = await getAgentBySlug(slug);
  if (existing && isUuid(existing.id)) return existing;

  const featured = getFeaturedAgent(slug) || (slug === "noor-jewels" ? NOOR_JEWELS : null);
  if (!featured) return existing;

  return (await ensureAgentBySlug(featured)) || existing;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const key = searchParams.get("key") || "";
  const agent = await resolvePersistedAgent(slug);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isUuid(agent.id)) {
    return NextResponse.json({
      count: agent.followers_count || 0,
      following: false,
      people: [],
    });
  }

  const state = await getFollowState(agent.id, key || undefined);
  return NextResponse.json(state);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    action?: "follow" | "unfollow";
    visitorId?: string;
    userId?: string;
    displayName?: string;
  };
  const slug = body.slug || "";
  const userId = (body.userId || "").trim();
  if (!slug || !userId) {
    return NextResponse.json({ error: "Sign in to follow this agent." }, { status: 401 });
  }

  const agent = await resolvePersistedAgent(slug);
  if (!agent?.id || !isUuid(agent.id)) {
    return NextResponse.json(
      { error: "Could not save this agent to follow. Check Supabase is connected and schema.sql has been run." },
      { status: 400 },
    );
  }

  const name = body.displayName?.trim() || "Member";
  const result =
    body.action === "unfollow" ? await unfollowAgent(agent.id, userId) : await followAgent(agent.id, userId, name);

  if (!result) return NextResponse.json({ error: "Could not update follow." }, { status: 500 });
  const state = await getFollowState(agent.id, userId);
  return NextResponse.json(state);
}
