# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run Biome linter (biome check)
pnpm format       # Auto-format with Biome
```

No test suite is configured.

### Database (Supabase)

```bash
pnpm supabase:link    # Link to remote Supabase project
pnpm supabase:push    # Push local migrations to remote
pnpm seed:staging     # Seed staging DB (uses .env.local)
pnpm seed:production  # Seed production DB (uses .env.production)
```

Migrations live in `supabase/migrations/`. Run them via `supabase:push`.

## Architecture

**Tambay Games** is a party game hub (no login required). Current games: Pinoy Henyo, Who's the Impostor, and The Werewolf Game.

### Stack

- **Next.js 16** (App Router) — check `node_modules/next/dist/docs/` before writing Next.js code; APIs may differ from training data
- **Tailwind CSS v4** — configured via PostCSS, not `tailwind.config.*`
- **Supabase** (PostgreSQL + JS client) — public read-only RLS on word tables
- **Biome** — linter and formatter (not ESLint/Prettier)
- **PostHog** — analytics

### Data Flow

Each game fetches words from its API route (`/api/henyo/words`, `/api/impostor/words`), which queries Supabase. On failure, the client falls back to hardcoded JSON in `src/lib/*/fallback-words.json`. Word lists are cached in `sessionStorage` with a 5-minute TTL.

### Game State

Game logic lives in custom hooks:

- `src/hooks/useHenyoGame.ts` — manages setup → countdown → playing → results → game-over states
- `src/hooks/useImpostorGame.ts` — manages setup → role reveal → clue rounds → discussion → voting → results

### Key Patterns

- `src/contexts/LanguageContext.tsx` — Filipino/English UI toggle, persisted in `localStorage`
- `src/lib/*/wordService.ts` — fetch + cache + fallback logic per game
- `src/lib/impostor/roleAssigner.ts` — randomizes impostor role assignment
- Path alias `@/*` → `src/*`

### Environment Variables

| Variable                        | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key                                      |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog analytics key                                |
| `NEXT_PUBLIC_POSTHOG_HOST`      | PostHog host URL                                     |
| `DATABASE_URL`                  | Direct DB URL (seed scripts only, never client-side) |

Staging config in `.env.local`, production in `.env.production`.

## Coding Style

Applies to all `.ts`, `.tsx`, `.js`, `.jsx` files.

- **Arrow functions** — use arrow functions for all functions, including React components declared inside a file
- **No `var`** — use `const` by default; use `let` only when reassignment is needed
- **`async/await` over `.then()`** — always use `async/await` for asynchronous code
