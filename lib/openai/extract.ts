import { emptyKnowledge } from "@/lib/utils";
import { heuristicExtract } from "@/lib/sample-agent";
import { chatCompletion } from "@/lib/openrouter/client";
import type { AgentKnowledge, TranscriptTurn } from "@/types";

export const KNOWLEDGE_SCHEMA = `{
  "name": "",
  "category": "",
  "description": "",
  "location": "",
  "phone": "",
  "email": "",
  "website": "",
  "opening_hours": "",
  "products": [],
  "services": [],
  "pricing": [],
  "faqs": [],
  "important_information": [],
  "personality": "",
  "additional_knowledge": "",
  "logo": ""
}`;

export async function extractKnowledge(
  transcript: TranscriptTurn[],
  category: string,
  extras?: { existing?: AgentKnowledge | null; websiteText?: string; websiteUrl?: string },
): Promise<AgentKnowledge> {
  const conversation = transcript.map((t) => `${t.role}: ${t.text}`).join("\n");

  try {
    const raw = await chatCompletion({
      json: true,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are building a complete AI voice agent for a business.
Analyze ALL provided sources deeply: website text, existing structured data, and any voice conversation.
Merge them into one JSON object in this exact shape:
${KNOWLEDGE_SCHEMA}

Rules:
- Prefer website facts when they are explicit.
- Use the conversation to fill gaps and correct mistakes.
- Do not invent prices, products, hours, phone numbers, or policies.
- If something is unknown, leave it empty or use an empty array.
- category should be "${category}" unless the sources clearly say otherwise.
- website should be "${extras?.websiteUrl || extras?.existing?.website || ""}" when known.
- additional_knowledge should include useful extra details in plain language for a voice bot.
- faqs only from real source material.`,
        },
        {
          role: "user",
          content: [
            extras?.existing ? `Existing structured data:\n${JSON.stringify(extras.existing)}` : "",
            extras?.websiteText ? `Website content:\n${extras.websiteText}` : "",
            conversation ? `Voice conversation:\n${conversation}` : "",
          ]
            .filter(Boolean)
            .join("\n\n") || "No sources.",
        },
      ],
    });

    if (!raw) {
      return extras?.existing || heuristicExtract(transcript, category);
    }
    const parsed = JSON.parse(raw) as Partial<AgentKnowledge>;
    const knowledge = normalizeKnowledge(parsed, category);
    if (extras?.websiteUrl && !knowledge.website) knowledge.website = extras.websiteUrl;
    if (/noor\s*jewels/i.test(`${conversation} ${extras?.websiteText || ""}`) && !knowledge.name) {
      return heuristicExtract(transcript, category);
    }
    return knowledge;
  } catch (error) {
    console.error("extractKnowledge", error);
    return extras?.existing || heuristicExtract(transcript, category);
  }
}

export async function analyzeWebsiteKnowledge(options: {
  text: string;
  url: string;
  title?: string;
  category: string;
  pages?: string[];
}): Promise<AgentKnowledge> {
  try {
    const raw = await chatCompletion({
      json: true,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Deeply analyze this full-site crawl (homepage plus inner pages such as pricing, about, contact, products, FAQ).
Extract everything a voice receptionist would need.
Return JSON in this exact shape:
${KNOWLEDGE_SCHEMA}

Rules:
- Do not invent facts.
- Empty string or [] if unknown.
- category: "${options.category}"
- website: "${options.url}"
- Put every explicit price, plan, or package into pricing[].
- Capture products, services, hours, location, contact, FAQs, and brand voice.
- Prefer details from pricing/contact/about pages when they conflict with the homepage.`,
        },
        {
          role: "user",
          content: `URL: ${options.url}\nTitle: ${options.title || ""}\nPages crawled:\n${(options.pages || []).join("\n")}\n\n${options.text}`,
        },
      ],
    });
    if (!raw) return emptyKnowledge(options.category);
    const knowledge = normalizeKnowledge(JSON.parse(raw) as Partial<AgentKnowledge>, options.category);
    knowledge.website = knowledge.website || options.url;
    return knowledge;
  } catch (error) {
    console.error("analyzeWebsiteKnowledge", error);
    return {
      ...emptyKnowledge(options.category),
      website: options.url,
      additional_knowledge: options.text.slice(0, 4000),
    };
  }
}

export function normalizeKnowledge(parsed: Partial<AgentKnowledge>, category: string): AgentKnowledge {
  const base = emptyKnowledge(category);
  return {
    ...base,
    ...parsed,
    category: parsed.category || category,
    name: String(parsed.name || ""),
    description: String(parsed.description || ""),
    location: String(parsed.location || ""),
    phone: String(parsed.phone || ""),
    email: String(parsed.email || ""),
    website: String(parsed.website || ""),
    opening_hours: String(parsed.opening_hours || ""),
    products: toStringArray(parsed.products),
    services: toStringArray(parsed.services),
    pricing: toStringArray(parsed.pricing),
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
    important_information: toStringArray(parsed.important_information),
    personality: String(parsed.personality || ""),
    additional_knowledge: String(parsed.additional_knowledge || ""),
    logo: String(parsed.logo || ""),
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
}
