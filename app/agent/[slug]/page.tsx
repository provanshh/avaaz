"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { AgentLogo } from "@/components/agent/agent-logo";
import { ShareModal } from "@/components/agent/share-modal";
import { NOOR_JEWELS } from "@/lib/sample-agent";
import { getLocalAgent, saveLocalAgent, updateLocalAgent } from "@/lib/agents/local";
import { displayName, shareLabel } from "@/lib/utils";
import { VOICE_OPTIONS } from "@/lib/voice";
import type { AgentRecord, VoicePersonality } from "@/types";

export default function AgentDashboardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customize, setCustomize] = useState(false);

  useEffect(() => {
    let local = getLocalAgent(slug);
    if (slug === "noor-jewels" && !local) {
      saveLocalAgent(NOOR_JEWELS);
      local = NOOR_JEWELS;
    }
    if (local) {
      queueMicrotask(() => setAgent(local));
    }

    fetch(`/api/agents?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.agent) {
          setAgent(data.agent);
          saveLocalAgent(data.agent);
        }
      })
      .catch(() => {
        if (!local && slug === "noor-jewels") setAgent(NOOR_JEWELS);
      });
  }, [slug]);

  if (!agent) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="pt-32 text-center text-sm text-muted">Looking for your agent...</p>
      </div>
    );
  }

  const currentAgent = agent;
  const title = displayName(currentAgent.name);
  const checks = [
    currentAgent.description || currentAgent.location ? "Business information" : null,
    currentAgent.products.length ? "Products" : null,
    currentAgent.opening_hours ? "Opening hours" : null,
    currentAgent.faqs.length ? "FAQs" : null,
    currentAgent.knowledge ? "Uploaded documents" : "Knowledge",
  ].filter(Boolean) as string[];

  async function copy() {
    const url = `${window.location.origin}/talk/${currentAgent.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function setVoice(voice: VoicePersonality) {
    setAgent({ ...currentAgent, voice });
    updateLocalAgent(currentAgent.slug, { voice });
    await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: currentAgent.slug, voice }),
    });
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pt-16">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Your AI agent</p>
        <div className="mt-6 rounded-[28px] border border-border bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <AgentLogo name={currentAgent.name} website={currentAgent.website} logo={currentAgent.logo} size="lg" />
              <div>
                <h1 className="font-serif text-4xl">{title}</h1>
                <p className="mt-1 text-sm text-muted">AI Voice Agent</p>
              </div>
            </div>
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="size-2 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>

          <Button asChild size="lg" className="mt-8 w-full">
            <Link href={`/talk/${agent.slug}`}>
              <Mic className="size-4" /> Talk to {agent.name.split(" ")[0]}
            </Link>
          </Button>

          <div className="mt-10">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Agent knowledge</p>
            <ul className="mt-4 space-y-2">
              {checks.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-accent" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setShareOpen(true)}>Share Agent</Button>
            <Button variant="outline" onClick={() => setCustomize((v) => !v)}>
              Customize
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/talk/${agent.slug}`)}>
              Open public agent
            </Button>
          </div>

          {customize && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Voice</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {VOICE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => void setVoice(option.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      agent.voice === option.id ? "border-black bg-accent-soft" : "border-border"
                    }`}
                  >
                    {option.label}
                    <span className="ml-1 capitalize text-muted">· {option.gender}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-[#fafaf8] px-4 py-3">
            <code className="truncate text-xs text-muted">{shareLabel(agent.slug)}</code>
            <button type="button" onClick={() => void copy()} className="ml-3 text-muted hover:text-foreground">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
      </main>
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} slug={agent.slug} name={title} />
    </div>
  );
}
