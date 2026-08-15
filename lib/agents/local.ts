"use client";

import type { AgentRecord } from "@/types";

const KEY = "avaaz-local-agents";

export function saveLocalAgent(agent: AgentRecord) {
  if (typeof window === "undefined") return;
  const name = (agent.name || "").trim().toLowerCase();
  const all = listLocalAgents().filter((existing) => {
    if (existing.slug === agent.slug) return false;
    if (name && (existing.name || "").trim().toLowerCase() === name) return false;
    return true;
  });
  all.unshift(agent);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30)));
}

export function getLocalAgent(slug: string) {
  return listLocalAgents().find((a) => a.slug === slug) || null;
}

export function listLocalAgents(): AgentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AgentRecord[]) : [];
  } catch {
    return [];
  }
}

export function updateLocalAgent(slug: string, patch: Partial<AgentRecord>) {
  const all = listLocalAgents().map((a) => (a.slug === slug ? { ...a, ...patch } : a));
  localStorage.setItem(KEY, JSON.stringify(all));
  return all.find((a) => a.slug === slug) || null;
}
