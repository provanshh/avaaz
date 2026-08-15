# Avaaz

Give your knowledge a voice. Create an AI voice agent by simply talking.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage)
- OpenRouter (chat, speech-to-text, text-to-speech)

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your keys, then run the SQL in `supabase/schema.sql` (Supabase Dashboard → SQL Editor → Run).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Where it is used |
|---|---|
| `OPENROUTER_API_KEY` | Server-only. Chat, transcription, and voice |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional. Server uploads if you prefer the service role |
| `NEXT_PUBLIC_SITE_URL` | Optional. OpenRouter app attribution |

Never put `OPENROUTER_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client code.

Google sign-in uses Supabase Auth. In the Supabase dashboard enable the Google provider and add `http://localhost:3000/auth/callback` (and your production URL) to the redirect allow list.

## APIs required

1. **OpenRouter**
   - Chat completions to extract agent knowledge and run conversations
   - `/api/v1/audio/transcriptions` for speech-to-text
   - `/api/v1/audio/speech` for text-to-speech
2. **Supabase**
   - Postgres tables + Storage bucket `agent-files` from `supabase/schema.sql`

## Voice

The browser records microphone audio and sends it to `/api/voice/turn`. The server transcribes, replies with the agent's knowledge, and returns spoken audio. The OpenRouter key never ships to the browser.

## Walkthrough

1. Open `/`
2. Create my agent
3. Choose Business
4. Tap the mic and say:  
   *My business is Noor Jewels. We are a handmade jewellery store in Delhi. We are open from 10 AM to 8 PM. We sell necklaces, bracelets and rings.*
5. Answer a couple of follow-ups
6. Upload `public/samples/noor-jewels-catalog.pdf` (or `.txt`)
7. Create agent
8. Open public agent
9. Ask *What products do you sell?* and *What are your opening hours?*
10. Share → copy link / QR

## Routes

- `/` landing
- `/create` category
- `/create/voice` onboarding
- `/create/knowledge` files
- `/create/generating` creation
- `/agent/[slug]` dashboard
- `/talk/[slug]` public voice
- `/about` about
- `/pricing` pricing
