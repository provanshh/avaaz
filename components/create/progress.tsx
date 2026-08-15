"use client";

import { cn } from "@/lib/utils";

const steps = ["Category", "Website", "Talk", "Ready"];

export function CreateProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted sm:gap-4">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            {i > 0 && <span className="hidden h-px w-6 bg-border sm:block sm:w-8" />}
            <span className={cn(active && "text-foreground", done && "text-accent")}>
              {String(n).padStart(2, "0")} {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
