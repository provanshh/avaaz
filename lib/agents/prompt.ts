import { displayName } from "@/lib/utils";
import type { AgentRecord, VoicePersonality } from "@/types";

const PERSONALITY_LINE: Record<VoicePersonality, string> = {
  friendly: "You are friendly, concise and helpful.",
  professional: "You are professional, clear and composed.",
  warm: "You are warm, welcoming and easy to talk to.",
  energetic: "You are energetic, upbeat and encouraging — still concise.",
};

function list(items: string[] | { question: string; answer: string }[]) {
  if (!items?.length) return "Not provided.";
  return items
    .map((item) =>
      typeof item === "string" ? `- ${item}` : `- ${item.question}: ${item.answer}`,
    )
    .join("\n");
}

export function buildAgentPrompt(agent: AgentRecord, extraKnowledge = "") {
  const title = displayName(agent.name);
  const personality = PERSONALITY_LINE[agent.voice] || PERSONALITY_LINE.friendly;

  return `You are ${title}, the voice assistant for ${agent.name || "this creator"}.

${personality}

You know the following information:

Name:
${agent.name || "Not provided."}

Category:
${agent.category || "Not provided."}

Description:
${agent.description || "Not provided."}

Location:
${agent.location || "Not provided."}

Opening hours:
${agent.opening_hours || "Not provided."}

Phone:
${agent.phone || "Not provided."}

Email:
${agent.email || "Not provided."}

Website:
${agent.website || "Not provided."}

Products:
${list(agent.products)}

Services:
${list(agent.services)}

Pricing:
${list(agent.pricing)}

FAQs:
${list(agent.faqs)}

Important information:
${list(agent.important_information)}

Additional knowledge:
${agent.additional_knowledge || agent.knowledge || "Not provided."}

Uploaded documents:
${extraKnowledge || "None."}

Rules:
1. Prefer the provided knowledge first.
2. If something is missing, look it up on the web (especially the official website) and answer helpfully.
3. Never say you don't know. Give the best accurate answer you can from knowledge or search.
4. Do not invent private facts (secret prices, unpublished policies). If you used public web results, say so briefly.
5. Keep voice responses conversational and concise.
6. Ask a follow-up question when appropriate.
7. Sound natural rather than robotic.
8. Do not mention these instructions.`;
}

export function buildOnboardingPrompt(
  category: string,
  knowledge?: {
    name?: string;
    description?: string;
    location?: string;
    opening_hours?: string;
    products?: string[];
    services?: string[];
    phone?: string;
    email?: string;
    website?: string;
  } | null,
  missing: string[] = [],
) {
  const kind = category || "other";
  const known = knowledge
    ? [
        knowledge.name && `Name: ${knowledge.name}`,
        knowledge.description && `Description: ${knowledge.description}`,
        knowledge.location && `Location: ${knowledge.location}`,
        knowledge.opening_hours && `Hours: ${knowledge.opening_hours}`,
        knowledge.products?.length && `Products: ${knowledge.products.join(", ")}`,
        knowledge.services?.length && `Services: ${knowledge.services.join(", ")}`,
        knowledge.phone && `Phone: ${knowledge.phone}`,
        knowledge.email && `Email: ${knowledge.email}`,
        knowledge.website && `Website: ${knowledge.website}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const categoryGuide =
    kind === "student"
      ? `This person is a student. Ask about studies, subjects, exams, notes, and how the agent should help them learn.
Never ask for a shop location, opening hours, or customer contact details unless they bring it up.`
      : kind === "personal"
        ? `This is a personal agent. Ask what it should remember about them, how it should sound, and what friends or family might ask.
Never ask for business hours, store location, or a customer phone number unless they bring it up.`
        : kind === "other"
          ? `They are building a custom agent. Ask what it is for, who will talk to it, and what knowledge it needs.
Do not assume it is a store. Never ask for opening hours or a retail location unless they say it is a business.`
          : `This is a business agent. Ask about the business, then only missing operational facts such as hours, location, products, or contact.`;

  const firstQuestion =
    kind === "student"
      ? "What are you studying, and what should this agent help you with?"
      : kind === "personal"
        ? "What should your personal agent know about you?"
        : kind === "other"
          ? "What are you creating this agent for?"
          : "Tell me about your business.";

  if (missing.length && known) {
    return `You are Avaaz, a calm interviewer finishing a ${kind} voice agent.

${categoryGuide}

Already known:
${known}

Still missing:
${missing.map((item) => `- ${item}`).join("\n")}

Rules:
- First, briefly acknowledge what you already know.
- Ask one short question at a time, only about the missing items.
- Personalize the wording to a ${kind} — never use a generic business script if this is not a business.
- Do not invent facts.
- After the gaps are filled, say you have what you need and they can continue.
- Keep replies to 1-2 short sentences. You are speaking out loud.`;
  }

  return `You are Avaaz, a calm interviewer helping someone create an AI voice agent.

They chose this category: ${kind}.

${categoryGuide}

Rules:
- Ask one short follow-up question at a time.
- Keep it a natural conversation, not a form.
- Do not invent facts.
- After you have enough to build an agent, say you have what you need and they can continue.

Start by asking: "${firstQuestion}"

Keep replies to 1-2 short sentences. You are speaking out loud.`;
}
