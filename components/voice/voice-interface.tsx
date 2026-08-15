"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { MicButton } from "@/components/voice/mic-button";
import { Waveform } from "@/components/voice/waveform";
import { displayName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { applySpeechVoice, preloadSpeechVoices } from "@/lib/voice";
import type { AgentKnowledge, AgentRecord, TranscriptTurn, VoiceSessionState } from "@/types";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type Props = {
  mode: "onboarding" | "agent";
  agent?: AgentRecord | null;
  category?: string;
  seedKnowledge?: AgentKnowledge | null;
  missingFields?: string[];
  onTranscriptChange?: (turns: TranscriptTurn[]) => void;
  suggested?: string[];
  compact?: boolean;
  faqs?: { question: string; answer: string }[];
};

function splitExchange(turns: TranscriptTurn[]) {
  if (!turns.length) return { latest: [] as TranscriptTurn[], history: [] as TranscriptTurn[] };
  const latest: TranscriptTurn[] = [];
  let i = turns.length - 1;
  if (turns[i].role === "assistant") {
    latest.unshift(turns[i]);
    i -= 1;
    if (i >= 0 && turns[i].role === "user") {
      latest.unshift(turns[i]);
      i -= 1;
    }
  } else {
    latest.unshift(turns[i]);
    i -= 1;
  }
  return { latest, history: turns.slice(0, i + 1) };
}

function pairHistory(history: TranscriptTurn[]) {
  const pairs: { question: string; answer: string }[] = [];
  for (let i = 0; i < history.length; ) {
    const current = history[i];
    const next = history[i + 1];
    if (current.role === "user" && next?.role === "assistant") {
      pairs.push({ question: current.text, answer: next.text });
      i += 2;
    } else if (current.role === "assistant") {
      pairs.push({ question: "Agent", answer: current.text });
      i += 1;
    } else {
      pairs.push({ question: current.text, answer: "" });
      i += 1;
    }
  }
  return pairs;
}

export function VoiceInterface({
  mode,
  agent,
  category,
  seedKnowledge,
  missingFields,
  onTranscriptChange,
  suggested,
  compact,
  faqs,
}: Props) {
  const [state, setState] = useState<VoiceSessionState>("idle");
  const [error, setError] = useState("");
  const [live, setLive] = useState("");
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [typed, setTyped] = useState("");
  const [showType, setShowType] = useState(false);
  const [openHistory, setOpenHistory] = useState<number | null>(null);

  const turnsRef = useRef<TranscriptTurn[]>([]);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakDoneRef = useRef<(() => void) | null>(null);
  const keepOpenRef = useRef(true);

  useEffect(() => {
    turnsRef.current = turns;
    onTranscriptChange?.(turns);
  }, [turns, onTranscriptChange]);

  useEffect(() => {
    const stopVoices = preloadSpeechVoices();
    return () => {
      stopVoices();
      listeningRef.current = false;
      recRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const push = useCallback((role: "user" | "assistant", text: string) => {
    if (!text.trim()) return;
    const next = [...turnsRef.current, { role, text }];
    turnsRef.current = next;
    setTurns(next);
  }, []);

  function stopListening() {
    listeningRef.current = false;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }

  function cancelSpeech() {
    window.speechSynthesis?.cancel();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    speakDoneRef.current?.();
    speakDoneRef.current = null;
  }

  function speakLocal(text: string) {
    return new Promise<void>((resolve) => {
      if (!text || typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      applySpeechVoice(utterance, agent?.voice);
      const done = () => {
        if (speakDoneRef.current === done) speakDoneRef.current = null;
        resolve();
      };
      speakDoneRef.current = done;
      utterance.onend = done;
      utterance.onerror = done;
      setState("speaking");
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playAudio(base64: string, mime: string) {
    const audio = audioRef.current || new Audio();
    audioRef.current = audio;
    audio.src = `data:${mime};base64,${base64}`;
    setState("speaking");
    try {
      await audio.play();
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        speakDoneRef.current = done;
        audio.onended = done;
        audio.onerror = done;
      });
    } catch {
      await speakLocal("");
    }
  }

  async function sendTurn(options: { kickoff?: boolean; text?: string }) {
    keepOpenRef.current = true;
    stopListening();
    setError("");
    setState("processing");
    const form = new FormData();
    form.append("mode", mode);
    form.append("category", category || "other");
    form.append("voice", agent?.voice || "friendly");
    if (agent?.slug) form.append("slug", agent.slug);
    if (agent) form.append("agent", JSON.stringify(agent));
    form.append("history", JSON.stringify(turnsRef.current));
    if (options.kickoff) form.append("kickoff", "true");
    if (options.text) form.append("text", options.text);
    if (seedKnowledge) form.append("seed", JSON.stringify(seedKnowledge));
    if (missingFields?.length) form.append("missing", JSON.stringify(missingFields));

    try {
      const res = await fetch("/api/voice/turn", { method: "POST", body: form });
      const data = (await res.json()) as {
        userText?: string;
        assistantText?: string;
        audioBase64?: string;
        mime?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Voice request failed.");
        setState("idle");
        return;
      }
      if (data.userText) push("user", data.userText);
      else if (options.text) push("user", options.text);
      if (data.assistantText) push("assistant", data.assistantText);
      if (data.audioBase64) {
        await playAudio(data.audioBase64, data.mime || "audio/mpeg");
      } else if (data.assistantText) {
        await speakLocal(data.assistantText);
      }
      if (keepOpenRef.current) {
        await startListening();
      } else {
        setState("idle");
      }
    } catch {
      setError("Could not reach the voice service.");
      setState("idle");
    }
  }

  async function playFaq(question: string, answer: string) {
    keepOpenRef.current = true;
    stopListening();
    cancelSpeech();
    push("user", question);
    push("assistant", answer);
    await speakLocal(answer);
    if (keepOpenRef.current) await startListening();
    else setState("idle");
  }

  async function startListening() {
    setError("");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is needed to talk to Avaaz.");
      setShowType(true);
      setState("idle");
      return;
    }

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setShowType(true);
      setError("This browser can't transcribe speech. Type instead, or use Chrome/Edge.");
      setState("idle");
      return;
    }

    stopListening();
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += piece;
        else interim += piece;
      }
      setLive(interim || finalText);
      if (finalText.trim()) {
        listeningRef.current = false;
        rec.stop();
        setLive("");
        void sendTurn({ text: finalText.trim() });
      }
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access is needed to talk to Avaaz.");
        setShowType(true);
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setError("I didn't catch that. Try speaking again.");
      }
      if (!listeningRef.current) setState("idle");
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };
    recRef.current = rec;
    listeningRef.current = true;
    rec.start();
    setState("listening");
  }

  async function onMic() {
    if (state === "speaking") {
      cancelSpeech();
      return;
    }
    if (state === "listening") {
      listeningRef.current = false;
      const pending = live.trim();
      recRef.current?.stop();
      setLive("");
      if (pending) {
        await sendTurn({ text: pending });
      } else {
        setState("idle");
      }
      return;
    }
    if (state !== "idle") return;
    if (mode === "onboarding" && turnsRef.current.length === 0) {
      await sendTurn({ kickoff: true });
      return;
    }
    if (mode === "agent" && turnsRef.current.length === 0) {
      await sendTurn({ kickoff: true });
      return;
    }
    await startListening();
  }

  const label =
    state === "idle"
      ? mode === "agent"
        ? `Talk to ${agent?.name ? displayName(agent.name).replace(/ AI$/, "") : "the agent"}`
        : "Tap to start talking"
      : state === "listening"
        ? "Listening... speak your answer"
        : state === "processing"
          ? "Understanding you..."
          : "Speaking... tap to stop";

  const assistantName = mode === "onboarding" ? "Avaaz" : displayName(agent?.name || "Agent");
  const { latest, history } = splitExchange(turns);
  const historyPairs = pairHistory(history);

  return (
    <div className={cn("flex w-full flex-col items-center", compact && "h-full min-h-0")}>
      <audio ref={audioRef} className="hidden" />
      <div className="flex w-full max-w-lg shrink-0 flex-col items-center">
        <MicButton state={state} onClick={() => void onMic()} disabled={state === "processing"} />
        <p className="mt-5 text-sm text-muted">{label}</p>
        <div className="mt-3">
          <Waveform active={state === "listening" || state === "speaking"} />
        </div>

        {live && <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-foreground/80">{live}</p>}
        {error && <p className="mt-3 max-w-md text-center text-sm text-red-600">{error}</p>}

        {faqs && faqs.length > 0 && (
          <div className="mt-5 w-full">
            <p className="text-center text-[11px] uppercase tracking-[0.16em] text-muted">Most asked</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {faqs.map((faq) => (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => void playFaq(faq.question, faq.answer)}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted transition-colors hover:border-black/20 hover:text-foreground"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {suggested && suggested.length > 0 && !faqs?.length && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {suggested.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void sendTurn({ text: q })}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted transition-colors hover:border-black/20 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="mt-4 text-xs text-muted underline-offset-4 hover:underline"
          onClick={() => setShowType((v) => !v)}
        >
          {showType ? "Hide typing" : "Can't use mic? Type instead"}
        </button>

        {showType && (
          <form
            className="mt-3 flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!typed.trim()) return;
              void sendTurn({ text: typed.trim() });
              setTyped("");
            }}
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type a message"
              className="h-11 flex-1 rounded-full border border-border bg-white px-4 text-sm outline-none focus:border-black/30"
            />
            <button type="submit" className="h-11 rounded-full bg-foreground px-4 text-sm text-white">
              Send
            </button>
          </form>
        )}
      </div>

      <div className={cn("mt-5 w-full max-w-lg space-y-3", compact && "min-h-0 flex-1 overflow-y-auto pr-1")}>
        {latest.length > 0 && (
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Latest</p>
            <div className="mt-3 space-y-3">
              {latest.map((t, i) => (
                <p key={`latest-${t.role}-${i}`} className="text-sm leading-relaxed">
                  <span className="mr-2 text-xs uppercase tracking-wider text-muted">
                    {t.role === "assistant" ? assistantName : "You"}
                  </span>
                  {t.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {historyPairs.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">History</p>
            {historyPairs.map((pair, i) => {
              const open = openHistory === i;
              return (
                <div key={`hist-${i}`} className="overflow-hidden rounded-2xl border border-border bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    onClick={() => setOpenHistory(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="text-sm font-medium">{pair.question}</span>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
                  </button>
                  {open && pair.answer && (
                    <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted">{pair.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
