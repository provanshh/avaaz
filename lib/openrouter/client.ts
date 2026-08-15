import OpenAI from "openai";
import {
  hasOpenRouter,
  OPENROUTER_CHAT_MODEL,
  OPENROUTER_STT_MODEL,
  OPENROUTER_TTS_MODEL,
  openRouterHeaders,
} from "@/lib/env";
import type { VoicePersonality } from "@/types";

export const TTS_VOICES: Record<VoicePersonality, string> = {
  friendly: "nova",
  professional: "echo",
  warm: "coral",
  energetic: "shimmer",
};

export function getOpenRouter() {
  if (!hasOpenRouter()) return null;
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: openRouterHeaders(),
  });
}

export async function chatCompletion(options: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  json?: boolean;
  temperature?: number;
  search?: boolean;
}) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  if (options.search) {
    const searched = await chatWithWebSearch(options.messages, options.temperature ?? 0.6);
    if (searched) return searched;
  }

  const client = getOpenRouter();
  if (!client) return null;
  const response = await client.chat.completions.create({
    model: OPENROUTER_CHAT_MODEL,
    temperature: options.temperature ?? 0.6,
    response_format: options.json ? { type: "json_object" } : undefined,
    messages: options.messages,
  });
  return response.choices[0]?.message?.content || "";
}

async function chatWithWebSearch(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  temperature: number,
) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const attempts: Record<string, unknown>[] = [
    {
      model: OPENROUTER_CHAT_MODEL,
      temperature,
      messages,
      plugins: [{ id: "web", max_results: 5 }],
    },
    {
      model: OPENROUTER_CHAT_MODEL.includes(":online")
        ? OPENROUTER_CHAT_MODEL
        : `${OPENROUTER_CHAT_MODEL}:online`,
      temperature,
      messages,
    },
  ];

  for (const body of attempts) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          ...openRouterHeaders(),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch (error) {
      console.error("openrouter search", error);
    }
  }
  return null;
}

export async function transcribeAudio(file: File) {
  const client = getOpenRouter();
  if (!client) return null;
  const result = await client.audio.transcriptions.create({
    model: OPENROUTER_STT_MODEL,
    file,
  });
  return typeof result === "string" ? result : result.text;
}

export async function synthesizeSpeech(text: string, personality: VoicePersonality = "friendly") {
  const client = getOpenRouter();
  if (!client) return null;
  const response = await client.audio.speech.create({
    model: OPENROUTER_TTS_MODEL,
    input: text.slice(0, 4000),
    voice: (TTS_VOICES[personality] || "sage") as "alloy" | "ash" | "ballad" | "coral" | "echo" | "sage" | "shimmer" | "verse" | "marin" | "cedar",
    response_format: "mp3",
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}
