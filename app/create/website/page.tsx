"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { CreateProgress } from "@/components/create/progress";
import { ExtractReveal } from "@/components/create/extract-reveal";
import { useCreateFlow } from "@/lib/create-flow";
import { missingFieldsForCategory } from "@/lib/utils";
import type { AgentKnowledge } from "@/types";

export default function WebsitePage() {
  const { category, setKnowledge, setWebsite } = useCreateFlow();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [found, setFound] = useState<AgentKnowledge | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [pages, setPages] = useState<{ url: string; title: string }[]>([]);
  const router = useRouter();

  async function readSite() {
    setError("");
    setFound(null);
    setPages([]);
    setBusy(true);
    try {
      const res = await fetch("/api/website/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category: category || "business" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not read that website.");
        setBusy(false);
        return;
      }
      setFound(data.knowledge);
      setMissing(data.missing || missingFieldsForCategory(category, data.knowledge));
      setPages(data.pages || []);
      setKnowledge(data.knowledge);
      setWebsite({ url: data.url, text: data.text, missing: data.missing });
      setBusy(false);
    } catch {
      setError("Could not read that website.");
      setBusy(false);
    }
  }

  function skip() {
    setKnowledge(null);
    setWebsite({ url: "", text: "", missing: [] });
    router.push("/create/voice");
  }

  function continueNext() {
    if (missing.length === 0) {
      router.push("/create/knowledge");
      return;
    }
    router.push("/create/voice");
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="mx-auto max-w-xl px-6 pt-16">
        <CreateProgress step={2} />
        <h1 className="mt-10 text-center font-serif text-4xl sm:text-5xl">Do you have a website?</h1>
        <p className="mt-3 text-center text-muted">
          Paste the link. Firecrawl reads the whole site — pricing, about, contact, products — then we only ask by voice about what&apos;s still missing.
        </p>

        <div className="mt-10 rounded-[28px] border border-border bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <label className="text-xs uppercase tracking-[0.16em] text-muted">Website link</label>
          <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-[#fafaf8] px-4">
            <Globe className="size-4 shrink-0 text-muted" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourbusiness.com"
              className="h-12 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Button className="mt-4 w-full" size="lg" onClick={() => void readSite()} disabled={busy || !url.trim()}>
            {busy ? "Reading your website..." : "Read my website →"}
          </Button>
        </div>

        <ExtractReveal knowledge={found} scanning={busy} pages={pages} />

        {found && !busy && (
          <div className="mt-4">
            {missing.length > 0 ? (
              <p className="text-center text-sm leading-relaxed text-muted">
                Next we&apos;ll talk — only about: {missing.join(", ")}.
              </p>
            ) : (
              <p className="text-center text-sm leading-relaxed text-muted">
                That was enough to build your agent. You can add files next.
              </p>
            )}
            <Button className="mt-6 w-full" size="lg" onClick={continueNext}>
              {missing.length ? "Continue to voice →" : "Continue →"}
            </Button>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <button type="button" onClick={skip} className="mx-auto mt-8 block text-sm text-muted underline-offset-4 hover:underline">
          I don&apos;t have a website — continue with voice
        </button>
      </main>
    </div>
  );
}
