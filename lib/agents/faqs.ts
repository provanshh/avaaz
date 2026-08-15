import type { AgentRecord } from "@/types";

export type FaqItem = { question: string; answer: string };

function asFaq(item: unknown): FaqItem | null {
  if (!item) return null;
  if (typeof item === "string") {
    const [q, ...rest] = item.split("?");
    const answer = rest.join("?").trim();
    if (!q.trim() || !answer) return null;
    return { question: `${q.trim()}?`, answer };
  }
  if (typeof item === "object" && "question" in item && "answer" in item) {
    const question = String((item as FaqItem).question || "").trim();
    const answer = String((item as FaqItem).answer || "").trim();
    if (!question || !answer) return null;
    return { question, answer };
  }
  return null;
}

export function enhanceFaqs(agent: Pick<AgentRecord, "faqs" | "name" | "description" | "location" | "opening_hours" | "phone" | "email" | "website" | "products" | "services" | "pricing">): FaqItem[] {
  const seen = new Set<string>();
  const out: FaqItem[] = [];

  const push = (question: string, answer: string) => {
    const key = question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || !answer.trim() || seen.has(key) || out.length >= 5) return;
    seen.add(key);
    out.push({ question, answer: answer.trim() });
  };

  for (const raw of agent.faqs || []) {
    const faq = asFaq(raw);
    if (faq) push(faq.question, faq.answer);
  }

  if (agent.description) {
    push(`What is ${agent.name || "this"}?`, agent.description);
  }
  if (agent.products.length) {
    push("What do you offer?", agent.products.slice(0, 6).join(", "));
  } else if (agent.services.length) {
    push("What services do you provide?", agent.services.slice(0, 6).join(", "));
  }
  if (agent.opening_hours) {
    push("When are you available?", agent.opening_hours);
  }
  if (agent.location) {
    push("Where are you based?", agent.location);
  }
  const contact = [agent.phone, agent.email, agent.website].filter(Boolean).join(" · ");
  if (contact) {
    push("How can I get in touch?", contact);
  }
  if (agent.pricing.length) {
    push("How does pricing work?", agent.pricing.slice(0, 3).join(" · "));
  }

  if (out.length < 5) {
    push(
      "How can this voice agent help me?",
      `Ask ${agent.name || "this agent"} anything about ${agent.description || "their knowledge"} and you'll get a spoken answer.`,
    );
  }

  return out.slice(0, 5);
}
