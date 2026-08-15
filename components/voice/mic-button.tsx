"use client";

import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoiceSessionState } from "@/types";

export function MicButton({
  state,
  onClick,
  disabled,
}: {
  state: VoiceSessionState;
  onClick: () => void;
  disabled?: boolean;
}) {
  const live = state === "listening" || state === "speaking";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={state === "idle" ? "Start talking" : "Stop"}
      className={cn(
        "relative grid size-28 place-items-center rounded-full border border-black/80 bg-accent-soft transition-transform duration-200 hover:scale-[1.03] disabled:opacity-50 sm:size-32",
        live && "bg-white",
      )}
    >
      {live && <span className="mic-ring absolute inset-0 rounded-full border border-accent/40" />}
      {live && (
        <span className="mic-ring absolute inset-[-10px] rounded-full border border-accent/20" style={{ animationDelay: "0.4s" }} />
      )}
      <Mic className={cn("size-8", state === "listening" && "text-accent")} />
    </button>
  );
}
