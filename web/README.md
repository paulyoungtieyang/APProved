# APProved — Web App

A Next.js UI prototype of the APProved regulatory / medical-affairs platform:
persistent sidebar across 10 modules, mock data throughout except for two
modules that call a real LLM. Not connected to the Python workflow in the
parent folder — this is a separate, self-contained app.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

### Optional: enable real AI generation

Two modules — **Global Value Dossier** and **MSL Materials** — call a real
model instead of showing mock output. Without a key they still work; the
"Generate" button just returns a clear "not configured" error instead of a
draft.

```bash
cp .env.example .env.local
```

Set `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` in `.env.local`. Alternatively,
paste a key directly into **Settings → AI Generation** in the running app —
that key is stored in the browser (`localStorage`) and sent only to this
app's own API routes at generation time, never persisted server-side. The
Settings panel also lets you switch the active provider (Claude / OpenAI)
and add standing prompt instructions per module.

## What's real vs. mock

| Module | Status |
|---|---|
| Dashboard, Upload, Regulations, Document Library, Settings, Policy News, Resources, Submit | UI prototype — realistic, fully clickable, mock/simulated data |
| **Global Value Dossier**, **MSL Materials** | UI prototype **plus** real generation via Claude (`claude-opus-5`) or OpenAI (`gpt-4o`), selectable in Settings |

Every "Generate" click on those two modules spends real API tokens once a
key is configured — there's no cost otherwise.

## Project structure

```
src/
  app/                 # Next.js App Router pages, one folder per module
  app/api/             # generate-dossier, generate-material (server-only, call the LLM)
  components/          # one folder per module + shared ui/ and shell/
  lib/
    state/             # AppState (Context + useReducer), persisted to localStorage
    mock-data/         # seed data for every module
    server/            # Claude/OpenAI client helpers (server-only)
  styles/tokens.css    # design tokens, ported from the original demo HTML
```

## Useful commands

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npx tsc --noEmit # type-check only
```
