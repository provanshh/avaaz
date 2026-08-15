"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AgentCategory, AgentKnowledge, CreateFlowState, TranscriptTurn, VoicePersonality } from "@/types";

const KEY = "avaaz-create-flow";

const empty: CreateFlowState = {
  category: null,
  websiteUrl: "",
  websiteText: "",
  missingFields: [],
  transcript: [],
  knowledge: null,
  files: [],
  voice: "friendly",
};

type Ctx = CreateFlowState & {
  setCategory: (category: AgentCategory) => void;
  setWebsite: (website: { url?: string; text?: string; missing?: string[] }) => void;
  setTranscript: (transcript: TranscriptTurn[]) => void;
  setKnowledge: (knowledge: AgentKnowledge | null) => void;
  setFiles: (files: CreateFlowState["files"] | ((current: CreateFlowState["files"]) => CreateFlowState["files"])) => void;
  setVoice: (voice: VoicePersonality) => void;
  reset: () => void;
};

const CreateFlowContext = createContext<Ctx | null>(null);

function readFlow(): CreateFlowState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function persist(next: CreateFlowState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function CreateFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreateFlowState>(readFlow);

  const value = useMemo<Ctx>(() => {
    const patch = (updater: (s: CreateFlowState) => CreateFlowState) => {
      setState((s) => {
        const next = updater(s);
        persist(next);
        return next;
      });
    };

    return {
      ...state,
      setCategory: (category) => patch((s) => ({ ...s, category })),
      setWebsite: (website) =>
        patch((s) => ({
          ...s,
          websiteUrl: website.url ?? s.websiteUrl,
          websiteText: website.text ?? s.websiteText,
          missingFields: website.missing ?? s.missingFields,
        })),
      setTranscript: (transcript) => patch((s) => ({ ...s, transcript })),
      setKnowledge: (knowledge) => patch((s) => ({ ...s, knowledge })),
      setFiles: (files) =>
        patch((s) => ({ ...s, files: typeof files === "function" ? files(s.files) : files })),
      setVoice: (voice) => patch((s) => ({ ...s, voice })),
      reset: () => {
        persist(empty);
        setState(empty);
      },
    };
  }, [state]);

  return <CreateFlowContext.Provider value={value}>{children}</CreateFlowContext.Provider>;
}

export function useCreateFlow() {
  const ctx = useContext(CreateFlowContext);
  if (!ctx) throw new Error("useCreateFlow must be used within CreateFlowProvider");
  return ctx;
}
