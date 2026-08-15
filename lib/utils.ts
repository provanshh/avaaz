import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AgentKnowledge } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return base || "agent";
}

export function displayName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Avaaz Agent";
  if (/\bai\b/i.test(trimmed)) return trimmed;
  return `${trimmed.replace(/\s+ai$/i, "").trim()} AI`;
}

export function publicAgentUrl(slug: string, origin?: string) {
  const host = origin || (typeof window !== "undefined" ? window.location.origin : "https://avaaz.ai");
  return `${host}/talk/${slug}`;
}

export function shareLabel(slug: string) {
  return `avaaz.ai/talk/${slug}`;
}

export function emptyKnowledge(category = ""): AgentKnowledge {
  return {
    name: "",
    category,
    description: "",
    location: "",
    phone: "",
    email: "",
    website: "",
    opening_hours: "",
    products: [],
    services: [],
    pricing: [],
    faqs: [],
    important_information: [],
    personality: "",
    additional_knowledge: "",
    logo: "",
  };
}

export function missingFieldsForCategory(category: string | null | undefined, k: AgentKnowledge | null) {
  const kind = category || k?.category || "other";

  if (kind === "student") {
    if (!k) return ["what you're studying", "what this agent should help with", "subjects or notes it should know"];
    const missing: string[] = [];
    if (!k.name) missing.push("what to call this agent");
    if (!k.description) missing.push("what you're studying and what help you need");
    if (!k.products.length && !k.services.length && !k.additional_knowledge) {
      missing.push("subjects, exams, or notes it should know");
    }
    return missing;
  }

  if (kind === "personal") {
    if (!k) return ["your name", "what this agent should know about you", "what people will ask it"];
    const missing: string[] = [];
    if (!k.name) missing.push("your name");
    if (!k.description) missing.push("what this agent should know about you");
    if (!k.additional_knowledge && !k.important_information.length) {
      missing.push("details friends or family might ask");
    }
    return missing;
  }

  if (kind === "other") {
    if (!k) return ["what this agent is for", "who will talk to it", "what it should know"];
    const missing: string[] = [];
    if (!k.name) missing.push("what to call this agent");
    if (!k.description) missing.push("what this agent is for");
    if (!k.additional_knowledge && !k.products.length && !k.services.length) {
      missing.push("the knowledge it should have");
    }
    return missing;
  }

  if (!k) {
    return ["business name", "what you do", "location", "opening hours", "products or services", "how customers can contact you"];
  }
  const missing: string[] = [];
  if (!k.name) missing.push("business name");
  if (!k.description) missing.push("what you do");
  if (!k.location) missing.push("location");
  if (!k.opening_hours) missing.push("opening hours");
  if (!k.products.length && !k.services.length) missing.push("products or services");
  if (!k.phone && !k.email) missing.push("how customers can contact you");
  return missing;
}

export function missingBusinessFields(k: AgentKnowledge | null) {
  return missingFieldsForCategory("business", k);
}

export function knowledgeDetails(k: AgentKnowledge) {
  const faqs = (k.faqs || [])
    .map((item) => (typeof item === "string" ? item : `${item.question}: ${item.answer}`))
    .filter(Boolean);
  return [
    { key: "name", label: "Name", value: k.name },
    { key: "description", label: "About", value: k.description },
    { key: "location", label: "Location", value: k.location },
    { key: "opening_hours", label: "Hours", value: k.opening_hours },
    { key: "phone", label: "Phone", value: k.phone },
    { key: "email", label: "Email", value: k.email },
    { key: "website", label: "Website", value: k.website },
    { key: "products", label: "Products", value: k.products.join(", ") },
    { key: "services", label: "Services", value: k.services.join(", ") },
    { key: "pricing", label: "Pricing", value: k.pricing.join(", ") },
    { key: "faqs", label: "FAQs", value: faqs.join(" · ") },
    { key: "important", label: "Notes", value: k.important_information.join(" · ") },
  ].filter((row) => row.value.trim().length > 0);
}

export function hasKnowledge(k: AgentKnowledge | null) {
  if (!k) return false;
  return Boolean(
    k.name ||
      k.description ||
      k.products.length ||
      k.services.length ||
      k.additional_knowledge ||
      k.opening_hours,
  );
}
