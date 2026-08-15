"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Copy } from "lucide-react";
import { AgentLogo } from "@/components/agent/agent-logo";
import { EmbedSnippet } from "@/components/agent/embed-snippet";
import { FollowControls } from "@/components/agent/follow-controls";
import { Navbar } from "@/components/navbar";
import { VoiceInterface } from "@/components/voice/voice-interface";
import { Button } from "@/components/ui/button";
import { enhanceFaqs } from "@/lib/agents/faqs";
import { NOOR_JEWELS } from "@/lib/sample-agent";
import { getFeaturedAgent } from "@/lib/featured-agents";
import { getLocalAgent } from "@/lib/agents/local";
import { displayName, publicAgentUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AgentRecord } from "@/types";

export default function TalkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="pt-24 text-center text-sm text-muted">Loading agent...</p>
        </div>
      }
    >
      <TalkPageInner />
    </Suspense>
  );
}

function TalkPageInner() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const slug = params.slug;
  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    const local = getLocalAgent(slug);
    if (local) queueMicrotask(() => setAgent(local));
    else if (getFeaturedAgent(slug)) queueMicrotask(() => setAgent(getFeaturedAgent(slug)!));
    else if (slug === "noor-jewels") queueMicrotask(() => setAgent(NOOR_JEWELS));

    fetch(`/api/agents?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.agent) setAgent(data.agent);
      })
      .catch(() => {
        const featured = getFeaturedAgent(slug);
        if (featured) setAgent(featured);
        else if (slug === "noor-jewels") setAgent(NOOR_JEWELS);
      });
  }, [slug]);

  if (!agent) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <Navbar />
        <p className="pt-24 text-center text-sm text-muted">This agent isn&apos;t available yet.</p>
      </div>
    );
  }

  const current = agent;
  const title = displayName(current.name);
  const faqs = enhanceFaqs(current);

  async function copy() {
    await navigator.clipboard.writeText(publicAgentUrl(current.slug));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {!embed && <Navbar />}
      <main className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="min-h-0 overflow-y-auto border-b border-border px-6 py-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
          <div className="flex items-start gap-4">
            <AgentLogo name={current.name} website={current.website} logo={current.logo} size="lg" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {current.category || "Agent"} · Live
              </p>
              <h1 className="mt-1 font-serif text-4xl leading-tight">{title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <span className="size-2 rounded-full bg-emerald-500" />
                Online
              </p>
            </div>
          </div>

          {current.description && (
            <p className="mt-5 text-sm leading-relaxed text-muted">{current.description}</p>
          )}

          <dl className="mt-5 grid gap-2 text-sm">
            {current.location && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">Location</dt>
                <dd>{current.location}</dd>
              </div>
            )}
            {current.opening_hours && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">Hours</dt>
                <dd>{current.opening_hours}</dd>
              </div>
            )}
            {(current.phone || current.email || current.website) && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">Contact</dt>
                <dd className="min-w-0 truncate">
                  {[current.phone, current.email, current.website].filter(Boolean).join(" · ")}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <FollowControls slug={current.slug} name={title} initialCount={current.followers_count || 0}>
              <Button size="sm" variant="outline" onClick={() => void copy()}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </FollowControls>
          </div>

          {!embed && (
            <div className="mt-8">
              <EmbedSnippet slug={current.slug} name={title} />
            </div>
          )}

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">FAQs</p>
            <div className="mt-4 space-y-2">
              {faqs.map((faq) => {
                const open = openFaq === faq.question;
                return (
                  <div key={faq.question} className="overflow-hidden rounded-2xl border border-border bg-white">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      onClick={() => setOpenFaq(open ? null : faq.question)}
                      aria-expanded={open}
                    >
                      <span className="text-sm font-medium">{faq.question}</span>
                      <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
                    </button>
                    {open && <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden bg-[#fcfcfa] px-6 py-6">
          <VoiceInterface mode="agent" agent={current} compact faqs={faqs} />
        </section>
      </main>
    </div>
  );
}
