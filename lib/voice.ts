import type { VoicePersonality } from "@/types";

export const VOICE_OPTIONS: {
  id: VoicePersonality;
  label: string;
  blurb: string;
  gender: "female" | "male";
  rate: number;
  pitch: number;
  hints: string[];
}[] = [
  {
    id: "friendly",
    label: "Nova",
    blurb: "Bright female voice",
    gender: "female",
    rate: 1.02,
    pitch: 1.03,
    hints: ["nova", "jenny", "zira", "samantha", "google us english"],
  },
  {
    id: "warm",
    label: "Coral",
    blurb: "Soft female voice",
    gender: "female",
    rate: 0.94,
    pitch: 1.06,
    hints: ["coral", "susan", "hazel", "moira", "victoria", "sonia"],
  },
  {
    id: "energetic",
    label: "Aria",
    blurb: "Lively female voice",
    gender: "female",
    rate: 1.12,
    pitch: 1.12,
    hints: ["aria", "karen", "tessa", "fiona", "kate", "samantha"],
  },
  {
    id: "professional",
    label: "Atlas",
    blurb: "Clear male voice",
    gender: "male",
    rate: 0.97,
    pitch: 0.86,
    hints: ["david", "guy", "mark", "james", "daniel", "andrew", "ryan", "echo", "george"],
  },
];

const FEMALE_HINTS = [
  "zira",
  "aria",
  "jenny",
  "susan",
  "hazel",
  "samantha",
  "victoria",
  "moira",
  "karen",
  "tessa",
  "fiona",
  "sonia",
  "kate",
  "female",
  "eva",
  "linda",
  "heera",
];
const MALE_HINTS = [
  "david",
  "mark",
  "guy",
  "james",
  "daniel",
  "george",
  "ravi",
  "thomas",
  "andrew",
  "ryan",
  "male",
  "richard",
  "fred",
];

export function voiceStyle(id?: VoicePersonality | null) {
  return VOICE_OPTIONS.find((v) => v.id === id) || VOICE_OPTIONS[0];
}

function classifyGender(voice: SpeechSynthesisVoice): "female" | "male" | "unknown" {
  const name = voice.name.toLowerCase();
  if (FEMALE_HINTS.some((h) => name.includes(h))) return "female";
  if (MALE_HINTS.some((h) => name.includes(h))) return "male";
  if (/\bfemale\b/.test(name)) return "female";
  if (/\bmale\b/.test(name)) return "male";
  return "unknown";
}

function englishVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const all = window.speechSynthesis.getVoices();
  const en = all.filter((v) => /^en(-|_|$)/i.test(v.lang) || /english/i.test(v.name));
  return en.length ? en : all;
}

const assigned = new Map<VoicePersonality, string>();

function assignVoices() {
  const pool = englishVoices();
  if (!pool.length) return;
  assigned.clear();
  const used = new Set<string>();

  const take = (option: (typeof VOICE_OPTIONS)[number]) => {
    const preferred = pool.filter((v) => {
      const gender = classifyGender(v);
      return option.gender === "male" ? gender === "male" : gender !== "male";
    });
    const search = preferred.length ? preferred : pool;
    const hinted = search.find(
      (v) => !used.has(v.voiceURI) && option.hints.some((h) => v.name.toLowerCase().includes(h)),
    );
    const next = hinted || search.find((v) => !used.has(v.voiceURI)) || pool.find((v) => !used.has(v.voiceURI));
    if (!next) return;
    used.add(next.voiceURI);
    assigned.set(option.id, next.voiceURI);
  };

  VOICE_OPTIONS.forEach(take);
}

export function preloadSpeechVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return () => {};
  const load = () => assignVoices();
  load();
  window.speechSynthesis.addEventListener("voiceschanged", load);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
}

export function getSpeechVoice(id?: VoicePersonality | null): SpeechSynthesisVoice | null {
  const style = voiceStyle(id);
  const pool = englishVoices();
  if (!pool.length) return null;
  if (!assigned.size) assignVoices();
  const uri = assigned.get(style.id);
  return pool.find((v) => v.voiceURI === uri) || null;
}

export function applySpeechVoice(utterance: SpeechSynthesisUtterance, id?: VoicePersonality | null) {
  const style = voiceStyle(id);
  utterance.rate = style.rate;
  utterance.pitch = style.pitch;
  const voice = getSpeechVoice(id);
  if (voice) utterance.voice = voice;
}

export function speakPreview(text: string, id: VoicePersonality) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const speak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    applySpeechVoice(utterance, id);
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length) {
    assignVoices();
    speak();
    return;
  }
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    assignVoices();
    speak();
  }, { once: true });
}
