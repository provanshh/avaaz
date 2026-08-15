export function hasOpenRouter() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function hasSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function openRouterHeaders() {
  return {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-OpenRouter-Title": "Avaaz",
  };
}

export const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini";
export const OPENROUTER_TTS_MODEL =
  process.env.OPENROUTER_TTS_MODEL || "openai/gpt-4o-mini-tts-2025-12-15";
export const OPENROUTER_STT_MODEL = process.env.OPENROUTER_STT_MODEL || "openai/whisper-large-v3";
