"use client";

import { agentLogoUrl } from "@/lib/logo";
import { cn } from "@/lib/utils";

export function AgentLogo({
  name,
  website,
  logo,
  size = "md",
}: {
  name?: string;
  website?: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
}) {
  const src = agentLogoUrl({ website, name, stored: logo });
  const box = size === "lg" ? "size-16" : size === "sm" ? "size-10" : "size-12";
  if (!src) {
    return (
      <div className={cn("grid place-items-center rounded-2xl bg-accent-soft text-sm font-medium", box)}>
        {(name || "A").slice(0, 1).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${name || "Agent"} logo`}
      className={cn("rounded-2xl border border-border bg-white object-contain p-1", box)}
    />
  );
}
