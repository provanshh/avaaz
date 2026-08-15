import { NextResponse } from "next/server";
import { analyzeWebsiteKnowledge } from "@/lib/openai/extract";
import { hasOpenRouter } from "@/lib/env";
import { emptyKnowledge, missingFieldsForCategory } from "@/lib/utils";
import { agentLogoUrl } from "@/lib/logo";
import { crawlWebsite } from "@/lib/website/firecrawl";
import { normalizeWebsiteUrl } from "@/lib/website/fetch";

export const maxDuration = 180;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { url?: string; category?: string };
  let url = "";
  try {
    url = normalizeWebsiteUrl(body.url || "");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Paste a valid website link." },
      { status: 400 },
    );
  }

  try {
    const site = await crawlWebsite(url);
    if (!site.text || site.text.length < 80) {
      return NextResponse.json(
        { error: "That site didn't have enough readable text. Try the homepage, or skip." },
        { status: 400 },
      );
    }

    const category = body.category || "business";
    const knowledge = hasOpenRouter()
      ? await analyzeWebsiteKnowledge({
          text: site.text,
          url: site.url,
          title: site.title,
          category,
          pages: site.pages.map((page) => page.url),
        })
      : {
          ...emptyKnowledge(category),
          name: site.title,
          website: site.url,
          additional_knowledge: site.text.slice(0, 4000),
        };

    if (knowledge && !knowledge.logo) {
      knowledge.logo = agentLogoUrl({ website: knowledge.website || site.url, name: knowledge.name || site.title });
    }

    return NextResponse.json({
      knowledge,
      missing: missingFieldsForCategory(category, knowledge),
      title: site.title,
      url: site.url,
      text: site.text,
      logo: knowledge.logo,
      pages: site.pages.map((page) => ({ url: page.url, title: page.title })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read that website." },
      { status: 400 },
    );
  }
}
