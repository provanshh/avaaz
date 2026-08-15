import { NextResponse } from "next/server";
import { extractKnowledge } from "@/lib/openai/extract";
import { hasKnowledge } from "@/lib/utils";
import type { AgentKnowledge, TranscriptTurn } from "@/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    transcript?: TranscriptTurn[];
    category?: string;
    existing?: AgentKnowledge | null;
    websiteText?: string;
    websiteUrl?: string;
  };

  const transcript = body.transcript || [];
  if (!transcript.length && !hasKnowledge(body.existing || null) && !body.websiteText) {
    return NextResponse.json(
      { error: "Add a website or talk a little more before continuing." },
      { status: 400 },
    );
  }

  const knowledge = await extractKnowledge(transcript, body.category || "", {
    existing: body.existing,
    websiteText: body.websiteText,
    websiteUrl: body.websiteUrl,
  });
  return NextResponse.json({ knowledge });
}
