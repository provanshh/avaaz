import { NextResponse } from "next/server";
import { buildAgentPrompt, buildOnboardingPrompt } from "@/lib/agents/prompt";
import { displayName } from "@/lib/utils";
import { chatCompletion } from "@/lib/openrouter/client";
import { hasOpenRouter } from "@/lib/env";
import { fallbackReplyForAgent, NOOR_JEWELS } from "@/lib/sample-agent";
import { getFeaturedAgent } from "@/lib/featured-agents";
import { getAgentBySlug } from "@/lib/supabase/agents";
import type { AgentRecord, TranscriptTurn } from "@/types";

export const maxDuration = 60;

function looksUnknown(text: string) {
  if (!text.trim()) return true;
  return /\b(i (do not|don't|dont) know|i'?m not sure|not (enough|in my) (information|knowledge)|i (don'?t|do not) have (that|enough|this)|cannot (find|answer)|no information)\b/i.test(
    text,
  );
}

export async function POST(req: Request) {
  const form = await req.formData();
  const mode = String(form.get("mode") || "onboarding") as "onboarding" | "agent";
  const slug = String(form.get("slug") || "");
  const category = String(form.get("category") || "business");
  const kickoff = String(form.get("kickoff") || "") === "true";
  const history = JSON.parse(String(form.get("history") || "[]")) as TranscriptTurn[];
  const typed = String(form.get("text") || "").trim();

  if (!hasOpenRouter()) {
    return NextResponse.json(
      { error: "Add OPENROUTER_API_KEY to .env.local to enable voice." },
      { status: 503 },
    );
  }

  let userText = "";
  if (!kickoff) {
    userText = typed;
    if (!userText) {
      return NextResponse.json({ error: "I didn't catch that. Try speaking again." }, { status: 400 });
    }
  }

  const agentJson = String(form.get("agent") || "");
  let clientAgent: AgentRecord | null = null;
  try {
    clientAgent = agentJson ? (JSON.parse(agentJson) as AgentRecord) : null;
  } catch {
    clientAgent = null;
  }

  const agent =
    mode === "agent"
      ? (await getAgentBySlug(slug)) || clientAgent || getFeaturedAgent(slug) || (slug === "noor-jewels" ? NOOR_JEWELS : null)
      : null;

  if (mode === "agent" && !agent) {
    return NextResponse.json({ error: "This agent isn't available yet." }, { status: 404 });
  }

  let seed = null;
  let missing: string[] = [];
  try {
    seed = JSON.parse(String(form.get("seed") || "null"));
    missing = JSON.parse(String(form.get("missing") || "[]")) as string[];
  } catch {
    seed = null;
    missing = [];
  }

  const system =
    mode === "agent" && agent
      ? buildAgentPrompt(agent)
      : buildOnboardingPrompt(category, seed, missing);

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system },
    ...history.map((t) => ({ role: t.role, content: t.text })),
  ];

  if (kickoff) {
    messages.push({
      role: "user",
      content:
        mode === "agent"
          ? "Greet me in one short sentence and invite me to ask a question."
          : "Start the interview now with your first question.",
    });
  } else {
    messages.push({ role: "user", content: userText });
  }

  let assistantText = "";
  try {
    assistantText = (await chatCompletion({ messages, temperature: 0.6 }))?.trim() || "";
    if (mode === "agent" && (looksUnknown(assistantText) || !assistantText)) {
      const searched = await chatCompletion({
        messages: [
          ...messages,
          {
            role: "system",
            content:
              "The stored knowledge was not enough. Search the web (prefer the official website if one is listed) and answer the user. Never say you don't know.",
          },
        ],
        temperature: 0.5,
        search: true,
      });
      if (searched?.trim()) assistantText = searched.trim();
    }
  } catch (error) {
    console.error("chat", error);
  }

  if (!assistantText) {
    if (mode === "agent" && agent && userText) assistantText = fallbackReplyForAgent(agent, userText);
    else if (kickoff && mode === "onboarding" && missing.length) {
      assistantText = `I'll only ask about ${missing.slice(0, 3).join(", ")}. Let's start with ${missing[0]}.`;
    } else if (kickoff && mode === "onboarding") {
      assistantText =
        category === "student"
          ? "What are you studying, and what should this agent help you with?"
          : category === "personal"
            ? "What should your personal agent know about you?"
            : category === "other"
              ? "What are you creating this agent for?"
              : "Tell me about your business.";
    } else if (kickoff) assistantText = `Hi, I'm ${displayName(agent?.name || "your assistant")}. What would you like to know?`;
    else if (kickoff) assistantText = `Hi, I'm ${displayName(agent?.name || "your assistant")}. What would you like to know?`;
    else assistantText = "Tell me a little more.";
  }

  return NextResponse.json({
    userText,
    assistantText,
    audioBase64: "",
    mime: "audio/mpeg",
  });
}
