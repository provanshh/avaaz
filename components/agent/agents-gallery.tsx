"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentLogo } from "@/components/agent/agent-logo";
import SpecularButton from "@/components/specular-button/SpecularButton";
import { FEATURED_AGENTS } from "@/lib/featured-agents";
import { listLocalAgents } from "@/lib/agents/local";
import { displayName } from "@/lib/utils";
import type { AgentRecord } from "@/types";

function agentKey(agent: AgentRecord) {
  const slug = (agent.slug || "").toLowerCase().replace(/-[a-z0-9]{4}$/, "");
  const name = (agent.name || "").trim().toLowerCase();
  return slug || name;
}

function uniqueAgents(agents: AgentRecord[]) {
  const seen = new Set<string>();
  return agents.filter((agent) => {
    const key = agentKey(agent);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function AgentsGallery() {
  const [agents, setAgents] = useState<AgentRecord[]>(FEATURED_AGENTS);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const local = uniqueAgents(listLocalAgents());

    fetch("/api/agents")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const remote = (data?.agents || []) as AgentRecord[];
        setAgents(uniqueAgents([...FEATURED_AGENTS, ...remote, ...local]).slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setAgents(uniqueAgents([...FEATURED_AGENTS, ...local]).slice(0, 8));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">Already live, Try now</p>
      <h2 className="mt-3 text-center font-serif text-4xl sm:text-5xl">Agents already made</h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted">
        Each one has a voice, knowledge, and a brand logo pulled from its website.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((agent) => (
          <SpecularButton
            key={agent.slug || agent.id}
            size="lg"
            radius={28}
            tint="#ffffff"
            tintOpacity={0.92}
            blur={8}
            textColor="#111111"
            lineColor="#ffffff"
            baseColor="#9a9a9a"
            intensity={1.15}
            shineSize={12}
            shineFade={36}
            thickness={1.2}
            speed={0.32}
            followMouse
            proximity={280}
            autoAnimate
            className="specular-button--card"
            onClick={() => router.push(`/talk/${agent.slug}`)}
          >
            <AgentLogo name={agent.name} website={agent.website} logo={agent.logo} />
            <h3 className="mt-4 font-serif text-xl leading-tight text-foreground">{displayName(agent.name)}</h3>
            <p className="mt-1 text-xs capitalize text-muted">{agent.category || "agent"}</p>
            <p className="mt-3 line-clamp-2 text-sm text-muted">{agent.description || "AI voice agent"}</p>
          </SpecularButton>
        ))}
      </div>
    </section>
  );
}
