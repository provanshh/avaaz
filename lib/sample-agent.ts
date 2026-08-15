import { emptyKnowledge } from "@/lib/utils";
import type { AgentKnowledge, AgentRecord, TranscriptTurn } from "@/types";

export const NOOR_JEWELS: AgentRecord = {
  id: "noor-jewels",
  slug: "noor-jewels",
  name: "Noor Jewels",
  category: "business",
  description: "Handmade jewellery store in Delhi offering necklaces, bracelets and rings.",
  location: "Delhi",
  phone: "",
  email: "",
  website: "",
  opening_hours: "10 AM to 8 PM",
  products: ["Necklaces", "Bracelets", "Rings"],
  services: ["Custom handmade jewellery"],
  pricing: [],
  faqs: [
    {
      question: "What products do you sell?",
      answer: "We sell handmade necklaces, bracelets and rings.",
    },
    {
      question: "What are your opening hours?",
      answer: "We are open from 10 AM to 8 PM.",
    },
  ],
  important_information: ["Handmade jewellery made in Delhi."],
  personality: "friendly",
  additional_knowledge: "",
  logo: "",
  followers_count: 0,
  knowledge:
    "Noor Jewels is a handmade jewellery store in Delhi. Open 10 AM to 8 PM. Products: necklaces, bracelets and rings.",
  voice: "friendly",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function fallbackReplyForAgent(agent: AgentRecord, userText: string) {
  const q = userText.toLowerCase();
  const products = agent.products.join(", ") || "the offerings in my knowledge";
  const hours = agent.opening_hours || "hours aren't listed yet — ask me something else I can look up";
  const location = agent.location || "a location isn't listed yet";
  const name = agent.name || "this agent";

  if (q.includes("product") || q.includes("sell") || q.includes("offer")) {
    return `${name} offers ${products}. Would you like to know about hours or how to get in touch?`;
  }
  if (q.includes("hour") || q.includes("open") || q.includes("time")) {
    return `We're open ${hours}. What else can I help with?`;
  }
  if (q.includes("where") || q.includes("location") || q.includes("based")) {
    return `We're in ${location}. Want product details next?`;
  }
  if (q.includes("contact") || q.includes("phone") || q.includes("email")) {
    const contact = [agent.phone, agent.email, agent.website].filter(Boolean).join(" · ");
    return contact
      ? `You can reach us at ${contact}.`
      : "Contact details aren't on file yet. What else can I help with?";
  }

  if (agent.description) {
    return `${agent.description} ${hours ? `Hours: ${hours}.` : ""} What would you like to know?`;
  }

  return `${agent.description || name} is here to help. Ask about offerings, hours, or how to get in touch.`;
}

export function heuristicExtract(transcript: TranscriptTurn[], category: string): AgentKnowledge {
  const text = transcript
    .filter((t) => t.role === "user")
    .map((t) => t.text)
    .join(" ");
  const full = transcript.map((t) => t.text).join(" ");
  const knowledge = emptyKnowledge(category);

  if (/noor\s*jewels/i.test(full)) {
    return {
      ...emptyKnowledge(category || "business"),
      name: NOOR_JEWELS.name,
      description: NOOR_JEWELS.description,
      location: NOOR_JEWELS.location,
      opening_hours: NOOR_JEWELS.opening_hours,
      products: NOOR_JEWELS.products,
      services: NOOR_JEWELS.services,
      faqs: NOOR_JEWELS.faqs,
      important_information: NOOR_JEWELS.important_information,
      personality: "friendly",
      additional_knowledge: NOOR_JEWELS.knowledge,
    };
  }

  const nameMatch =
    text.match(/(?:called|name is|business is|i(?:'| a)m)\s+([A-Z][\w'&]*(?:\s+[A-Z][\w'&]*){0,4})/i) ||
    text.match(/my (?:business|shop|store|company|studio) is\s+([^.,]+)/i);
  if (nameMatch) knowledge.name = nameMatch[1].trim();

  const locMatch = text.match(/\b(?:in|based in|from)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)/);
  if (locMatch) knowledge.location = locMatch[1].trim();

  const hoursMatch = text.match(
    /(?:open(?:ing hours)?|hours?|we(?:'| a)re open)\s*(?:from\s*)?(\d{1,2}\s*(?:AM|PM)\s*(?:to|-)\s*\d{1,2}\s*(?:AM|PM))/i,
  );
  if (hoursMatch) knowledge.opening_hours = hoursMatch[1].replace(/\s*-\s*/g, " to ");

  const sellMatch = text.match(/we sell\s+([^.]+)/i);
  if (sellMatch) {
    knowledge.products = sellMatch[1]
      .replace(/\band\b/gi, ",")
      .split(/,/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  knowledge.description = text.slice(0, 400).trim();
  knowledge.additional_knowledge = text.trim();
  knowledge.personality = "friendly";

  if (!knowledge.name && knowledge.description) {
    knowledge.name = category === "student" ? "Study" : category === "personal" ? "Personal" : "Custom";
  }

  return knowledge;
}
