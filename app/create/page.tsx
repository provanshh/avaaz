"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { CreateProgress } from "@/components/create/progress";
import { useCreateFlow } from "@/lib/create-flow";
import { cn } from "@/lib/utils";
import type { AgentCategory } from "@/types";

const cards: { id: AgentCategory; title: string; body: string; icon: typeof Building2 }[] = [
  { id: "business", title: "Business", body: "Let customers talk to your AI.", icon: Building2 },
  { id: "personal", title: "Personal", body: "Create an AI that knows you.", icon: User },
  { id: "other", title: "Other", body: "Build anything you have in mind.", icon: Sparkles },
];

export default function CreatePage() {
  const { category, setCategory } = useCreateFlow();
  const router = useRouter();

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-16">
        <CreateProgress step={1} />
        <h1 className="mt-10 text-center font-serif text-4xl sm:text-5xl">What are you creating?</h1>
        <p className="mt-3 text-center text-muted">Choose how you plan to use your Avaaz agent.</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            const selected = category === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setCategory(card.id)}
                className={cn(
                  "rounded-3xl border bg-white p-6 text-left shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/15",
                  selected ? "border-black ring-2 ring-accent/30" : "border-border",
                )}
              >
                <Icon className={cn("size-6", selected ? "text-accent" : "text-foreground")} />
                <h2 className="mt-5 font-serif text-2xl">{card.title}</h2>
                <p className="mt-2 text-sm text-muted">{card.body}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            size="lg"
            disabled={!category}
            onClick={() => router.push(category === "business" ? "/create/website" : "/create/voice")}
          >
            Continue →
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Or <Link href="/" className="underline-offset-4 hover:underline">go back home</Link>
        </p>
      </main>
    </div>
  );
}
