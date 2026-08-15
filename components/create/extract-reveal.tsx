"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { agentLogoUrl } from "@/lib/logo";
import { knowledgeDetails } from "@/lib/utils";
import type { AgentKnowledge } from "@/types";

const SCAN = [
  "Mapping the website",
  "Crawling pricing and plans",
  "Reading about and contact pages",
  "Collecting products and services",
  "Finding hours, FAQs, and policies",
  "Matching the company logo",
];

export function ExtractReveal({
  knowledge,
  scanning,
  pages,
}: {
  knowledge: AgentKnowledge | null;
  scanning: boolean;
  pages?: { url: string; title: string }[];
}) {
  const [scanIndex, setScanIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const rows = knowledge ? knowledgeDetails(knowledge) : [];
  const logo = knowledge
    ? agentLogoUrl({ website: knowledge.website, name: knowledge.name, stored: knowledge.logo })
    : "";

  useEffect(() => {
    if (!scanning) return;
    setScanIndex(0);
    const id = window.setInterval(() => {
      setScanIndex((i) => (i + 1) % SCAN.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [scanning]);

  useEffect(() => {
    if (!knowledge || scanning) {
      setShown(0);
      return;
    }
    setShown(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= rows.length + 1) window.clearInterval(id);
    }, 420);
    return () => window.clearInterval(id);
  }, [knowledge, scanning, rows.length]);

  if (scanning) {
    return (
      <div className="mt-8 rounded-[28px] border border-border bg-white p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">Extracting</p>
        <div className="mt-5 space-y-3">
          {SCAN.map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`size-2 rounded-full ${i === scanIndex ? "bg-accent" : i < scanIndex ? "bg-accent/40" : "bg-border"}`}
              />
              <span className={i === scanIndex ? "text-foreground" : "text-muted"}>{step}{i === scanIndex ? "…" : ""}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!knowledge) return null;

  return (
    <div className="mt-8 rounded-[28px] border border-border bg-white p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">What we extracted</p>
      {pages && pages.length > 0 && shown > 0 && (
        <p className="mt-2 text-xs text-muted">
          Crawled {pages.length} pages{pages.some((page) => /pric/i.test(page.url + page.title)) ? ", including pricing" : ""}.
        </p>
      )}
      <div className="mt-5 flex items-center gap-4">
        {logo && shown > 0 && (
          <img
            src={logo}
            alt={`${knowledge.name || "Brand"} logo`}
            className="size-14 rounded-2xl border border-border bg-[#fafaf8] object-contain p-1"
          />
        )}
        <div>
          <h2 className="font-serif text-2xl">{knowledge.name || "Your business"}</h2>
          {shown > 0 && <p className="text-xs text-accent">Logo fetched</p>}
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map((row, i) =>
          i < shown ? (
            <li key={row.key} className="animate-fade-up border-t border-border pt-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
                <Check className="size-3.5 text-accent" /> {row.label} fetched
              </p>
              <p className="mt-1 text-sm leading-relaxed">{row.value}</p>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}
