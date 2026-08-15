"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { CreateProgress } from "@/components/create/progress";
import { VoiceInterface } from "@/components/voice/voice-interface";
import { useCreateFlow } from "@/lib/create-flow";
import { hasKnowledge, missingFieldsForCategory } from "@/lib/utils";
import type { TranscriptTurn } from "@/types";

export default function VoiceOnboardingPage() {
  const { category, knowledge, websiteText, websiteUrl, missingFields, setTranscript, setKnowledge } =
    useCreateFlow();
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const missing = missingFields.length ? missingFields : missingFieldsForCategory(category, knowledge);
  const fromSite = Boolean(websiteUrl || hasKnowledge(knowledge));

  async function continueFlow() {
    setError("");
    const userTurns = turns.filter((t) => t.role === "user");
    if (!userTurns.length && !hasKnowledge(knowledge)) {
      setError("Tell Avaaz a little about what this agent should know, or go back and add a website.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/agents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: turns,
          category,
          existing: knowledge,
          websiteText,
          websiteUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not organize that.");
        setBusy(false);
        return;
      }
      setTranscript(turns);
      setKnowledge(data.knowledge);
      router.push("/create/knowledge");
    } catch {
      setError("Something went wrong organizing your conversation.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-16">
        <CreateProgress step={3} />
        <h1 className="mt-10 text-center font-serif text-4xl sm:text-5xl">
          {fromSite ? "Fill in what's missing." : "Tell Avaaz about it."}
        </h1>
        <p className="mt-3 text-center text-muted">
          {fromSite && missing.length
            ? `I already read your website. We'll only talk about: ${missing.join(", ")}.`
            : category === "personal"
                ? "I'll ask what this agent should know about you — not business hours."
                : "Speak naturally. I'll organize everything for you."}
        </p>
        <div className="mt-14">
          <VoiceInterface
            mode="onboarding"
            category={category || "other"}
            seedKnowledge={knowledge}
            missingFields={missing}
            onTranscriptChange={setTurns}
          />
        </div>
        {error && <p className="mt-6 text-center text-sm text-red-600">{error}</p>}
        <div className="mt-10 flex justify-center">
          <Button size="lg" onClick={continueFlow} disabled={busy}>
            {busy ? "Organizing..." : "Continue →"}
          </Button>
        </div>
      </main>
    </div>
  );
}
