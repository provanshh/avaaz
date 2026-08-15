"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmbedSnippet({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://avaaz.ai";
  const snippet = `<iframe\n  src="${origin}/talk/${slug}?embed=1"\n  title="${name}"\n  width="380"\n  height="640"\n  style="border:1px solid #eaeaea;border-radius:24px;max-width:100%"\n  allow="microphone"\n></iframe>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Developers</p>
          <p className="mt-1 text-sm text-muted">Embed this agent on any website.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void copy()}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f6f6f3] p-3 text-[11px] leading-relaxed text-foreground/80">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
