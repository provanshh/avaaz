"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakPreview, VOICE_OPTIONS } from "@/lib/voice";
import type { VoicePersonality } from "@/types";

export function VoicePicker({
  value,
  onChange,
}: {
  value: VoicePersonality;
  onChange: (voice: VoicePersonality) => void;
}) {
  return (
    <div>
      <p className="text-center text-[11px] uppercase tracking-[0.18em] text-muted">Agent voice</p>
      <p className="mt-2 text-center text-sm text-muted">Three female voices and one male — tap the speaker to hear each.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {VOICE_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-2xl border bg-white p-4 text-left transition-all",
                selected ? "border-black ring-2 ring-accent/30" : "border-border hover:border-black/15",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="mt-1 text-xs capitalize text-muted">
                    {option.gender} · {option.blurb}
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  className="grid size-8 place-items-center rounded-full border border-border text-muted hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.id);
                    speakPreview(`Hi, I'm ${option.label}, your ${option.gender} Avaaz agent.`, option.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(option.id);
                    speakPreview(`Hi, I'm ${option.label}, your ${option.gender} Avaaz agent.`, option.id);
                  }}
                  aria-label={`Preview ${option.label}`}
                >
                  <Volume2 className="size-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
