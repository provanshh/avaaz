"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CreateProgress } from "@/components/create/progress";
import { saveLocalAgent } from "@/lib/agents/local";
import { useCreateFlow } from "@/lib/create-flow";
import { emptyKnowledge, hasKnowledge } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AgentRecord } from "@/types";

const STEPS = [
  "Reading your sources",
  "Analyzing the business",
  "Building the voice agent",
  "Preparing your voice",
];

export default function GeneratingPage() {
  const { category, knowledge, files, voice, transcript } = useCreateFlow();
  const [done, setDone] = useState<number>(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timers = STEPS.map((_, i) =>
      window.setTimeout(() => {
        if (!cancelled) setDone(i + 1);
      }, 700 * (i + 1)),
    );

    async function create() {
      const payloadKnowledge = hasKnowledge(knowledge)
        ? knowledge!
        : {
            ...emptyKnowledge(category || "other"),
            name: "Avaaz Agent",
            additional_knowledge: transcript.map((t) => t.text).join(" "),
            description: transcript
              .filter((t) => t.role === "user")
              .map((t) => t.text)
              .join(" "),
          };

      if (!payloadKnowledge.description && !payloadKnowledge.additional_knowledge && !files.length) {
        setError("Empty agent data. Go back and talk a little more.");
        return;
      }

      const form = new FormData();
      form.append(
        "payload",
        JSON.stringify({
          knowledge: payloadKnowledge,
          voice,
          files,
        }),
      );

      try {
        const res = await fetch("/api/agents", { method: "POST", body: form });
        const data = (await res.json()) as { agent?: AgentRecord; error?: string };
        if (!res.ok || !data.agent) {
          setError(data.error || "Could not create your agent.");
          return;
        }
        saveLocalAgent(data.agent);
        window.setTimeout(() => {
          if (!cancelled) {
            setReady(true);
            router.push(`/talk/${data.agent!.slug}`);
          }
        }, 3200);
      } catch {
        setError("Could not create your agent.");
      }
    }

    void create();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [category, files, knowledge, router, transcript, voice]);

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 pt-24 text-center">
        <CreateProgress step={4} />
        <h1 className="mt-12 font-serif text-4xl">
          {ready ? "Your agent is ready." : "Creating your agent..."}
        </h1>
        <div className="mx-auto mt-12 w-full max-w-sm space-y-4 text-left">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border",
                  done > i ? "border-accent bg-accent-soft" : "border-border",
                )}
              >
                {done > i ? <Check className="size-3.5 text-accent" /> : <span className="size-1.5 rounded-full bg-border" />}
              </span>
              <span className={done > i ? "text-foreground" : "text-muted"}>{label}</span>
            </div>
          ))}
        </div>
        {error && <p className="mt-8 text-sm text-red-600">{error}</p>}
      </main>
    </div>
  );
}
