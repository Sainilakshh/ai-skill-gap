# Skill DNA

AI-powered career intelligence system for the HackNTech hackathon (Future of Work / EduTech).

Not a resume analyzer — a skill intelligence engine: extracts explicit + AI-inferred skills
from a resume and GitHub profile, renders them as a 3D Skill DNA graph, compares against a
target role, shows an explainable gap report, lets you simulate adding a skill (WHAT IF), and
generates a roadmap.

## Architecture (hybrid AI — works even if APIs fail)

1. **Deterministic layer** (`src/lib/skillEngine.js`) — keyword-taxonomy matching for explicit
   skills, GitHub public API for language/repo signals. Zero network dependency beyond GitHub.
2. **AI layer** (`api/analyze.js`, a Vercel serverless function) — Groq (primary) → Gemini
   (fallback) for hidden-skill inference, JD parsing, and roadmap notes. Keys never touch the
   browser.
3. **Fallback** — if both AI providers fail or time out, the app falls back to rule-based
   inference automatically. The demo never breaks on stage.

## 1. Install

```bash
npm install
```

## 2. Get your free API keys (~5 minutes total)

| Service | Where to get it | Used for |
|---|---|---|
| Groq | https://console.groq.com → API Keys | Primary hidden-skill inference, JD parsing |
| Gemini | https://aistudio.google.com/apikey | Fallback if Groq is rate-limited |
| Supabase | https://supabase.com → New project | Auth + saved analysis history |

## 3. Set up Supabase

1. Create a project at supabase.com (free tier).
2. Go to Project Settings → API, copy the **Project URL** and **anon public key**.
3. Go to SQL Editor → New query, paste the contents of `supabase_schema.sql`, run it.
4. (Optional) Settings → Authentication → disable "Confirm email" for faster hackathon demo signups.

## 4. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
GROQ_API_KEY=...
GEMINI_API_KEY=...
```

## 5. Run locally

```bash
npm run dev
```

Note: the serverless function (`/api/analyze`) only runs under Vercel's dev server or after
deploy. For local testing without `vercel dev`, the app still works fully via **TRY DEMO** and
the deterministic fallback — the AI inference step will simply fall back silently.

To test the API locally with Vercel's CLI:

```bash
npm i -g vercel
vercel dev
```

## 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then in the Vercel dashboard → Project → Settings → Environment Variables, add:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`.

Redeploy after adding env vars (`vercel --prod`).

## Judge demo script (under 2 minutes)

1. Land on the homepage → click **"Try demo — no signup"** (zero network dependency, always works).
2. Skill DNA graph renders instantly — orbit it, click a node → evidence panel shows why that
   skill was detected, explicit vs inferred clearly labeled.
3. Continue to **Target Role** → role is pre-selected (AI/ML Engineer) → **Gap Analysis** shows
   an explainable per-skill comparison, not a mystery score.
4. Go to **WHAT IF** → click "+Docker" → graph, gap %, and roadmap all update instantly.
5. **Roadmap** → prioritized, weeks-based plan.
6. (Optional) Sign in → "Save to history" on the Skill DNA screen → open "My Analyses" to show
   persistence.

## What's intentionally cut for the 1-day build

- No PDF parsing yet — paste resume text or upload `.txt` (swap in `pdfjs-dist` later for
  real PDF support).
- No GitHub OAuth — uses GitHub's public API for repos/languages (no token needed, works for
  any public profile).
- WHAT IF recalculates via rule-based logic instantly rather than another AI call, so it never
  lags in front of judges.
