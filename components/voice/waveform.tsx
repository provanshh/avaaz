"use client";

import { cn } from "@/lib/utils";

export function Waveform({ active, className }: { active: boolean; className?: string }) {
  return (
    <div className={cn("flex h-9 items-end gap-[5px]", className)} aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="wave-bar w-[3px] rounded-full bg-accent"
          style={{
            height: `${12 + ((i * 7) % 18)}px`,
            animationDelay: `${i * 0.09}s`,
            animationPlayState: active ? "running" : "paused",
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

export function HeroWave() {
  return (
    <div className="mx-auto mt-10 flex h-16 items-end justify-center gap-1.5">
      {Array.from({ length: 28 }).map((_, i) => {
        const mid = Math.abs(i - 14);
        const h = 18 + Math.max(0, 28 - mid * 2.2);
        return (
          <span
            key={i}
            className="wave-bar w-[3px] rounded-full bg-accent/70"
            style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }}
          />
        );
      })}
    </div>
  );
}
