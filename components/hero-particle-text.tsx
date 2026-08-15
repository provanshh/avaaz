"use client";

import ParticleText from "@/components/particle-text/ParticleText";

export function HeroParticleText({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="mx-auto w-full max-w-4xl font-serif"
      style={{ width: "100%", height: compact ? 160 : 220 }}
    >
      <ParticleText
        text="Avaaz - Agent for Voice Agents"
        particleSize={compact ? 1.6 : 2}
        density={compact ? 5 : 4}
        color="#111111"
        highlightColor="#6d5dfb"
        scatter={compact ? 90 : 180}
        gatherDuration={1600}
        stagger={420}
        pointerRepel={32}
        repelRadius={100}
        idleDrift={0.55}
        trigger="hover"
        fontSize={compact ? "clamp(1.15rem, 4.2vw, 2.4rem)" : "clamp(1.6rem, 6.5vw, 4.2rem)"}
        fontWeight={400}
        fontFamily="inherit"
        glow
        className={compact ? "particle-text--compact" : ""}
      />
    </div>
  );
}
