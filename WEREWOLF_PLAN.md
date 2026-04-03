# Werewolf Game — Implementation Plan

## Game Summary

Werewolf is a co-located hidden-role social deduction party game for 4–15 players. Each player uses their own phone. The app acts as the moderator — no human moderator needed.

### Roles

| Role     | Team    | Night Power                    |
| -------- | ------- | ------------------------------ |
| Villager | Village | None                           |
| Werewolf | Wolves  | Vote to kill one villager      |
| Seer     | Village | Peek at one player's true role |
| Doctor   | Village | Protect one player from death  |

**Werewolf count:** 1 for 4–6 players · 2 for 7–10 · 3 for 11–15

### Win Conditions

- **Village wins** — all werewolves are eliminated
- **Werewolves win** — werewolves ≥ remaining villagers

### Phase Loop

```
lobby → role_reveal → night → night_resolving → day_announcement
     → discussion → day_vote → elimination → [repeat or game_over]
```

### Critical Night Phase UX

Every player — including villagers — performs a mandatory "close your eyes" tap so no one can tell who has an active role by watching who taps. Role-holders get their private action screen after; villagers see a passive sleeping screen.

---

## Supabase Dashboard Setup (Do This Before Running Migrations)

Supabase Realtime Postgres Changes requires tables to be explicitly added to the **replication publication**. This is NOT done automatically when you create a table.

### Steps in the Supabase Dashboard

<!-- Is replication required? It is not free in Supabase. Is it different from Supabase Realtime? Can we use Supabase Realtime only so we keep it free? -->

1. **Go to:** Database → Replication → `supabase_realtime` publication
2. **Enable replication for these two tables:**
   - `werewolf_rooms` — needed so all clients react to phase changes
   - `werewolf_players` — needed so all clients see roster updates (joins, eliminations)
   - _(Do NOT add `werewolf_night_actions` or `werewolf_day_votes` — these are private and should never broadcast to clients)_

3. **Add environment variable** to your `.env.local` and `.env.production`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<your service role key>
   ```
   Find this in: Supabase Dashboard → Project Settings → API → `service_role` key.
   This is a **secret server-side key** — never prefix with `NEXT_PUBLIC_`.

> **Local dev note:** `supabase/config.toml` already has `[realtime] enabled = true`. For local dev, replication on new tables is enabled automatically via the migration SQL (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`). The dashboard step above applies to the **remote/production** project.

---

## Implementation Checklist

### Phase 0 — Supabase & Environment Setup

- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.production`
- [ ] In Supabase Dashboard (production): enable replication for `werewolf_rooms`
- [ ] In Supabase Dashboard (production): enable replication for `werewolf_players`

---

### Phase 1 — Database Migrations

- [x] `supabase/migrations/20260403000001_create_werewolf_rooms.sql`
  - Table: `werewolf_rooms` (id, room_code, host_id, phase, round_number, night_kill_target_id, night_saved, eliminated_player_id, winner, settings JSONB, created_at, updated_at)
  - Index on `room_code`
  - `updated_at` trigger
  - RLS: public SELECT; all writes blocked for anon (service role only)
  - `ALTER PUBLICATION supabase_realtime ADD TABLE werewolf_rooms`

- [x] `supabase/migrations/20260403000002_create_werewolf_players.sql`
  - Table: `werewolf_players` (id, room_id FK, player_id, name, role, is_alive, is_host, seat_order, joined_at)
  - UNIQUE on (room_id, player_id)
  - UNIQUE on (room_id, name)
  - Index on room_id
  - RLS: public SELECT (role column never queried by client SDK); writes blocked for anon
  - `ALTER PUBLICATION supabase_realtime ADD TABLE werewolf_players`

- [x] `supabase/migrations/20260403000003_create_werewolf_night_actions.sql`
  - Table: `werewolf_night_actions` (id, room_id FK, round_number, actor_id, action_type, target_id, submitted_at)
  - UNIQUE on (room_id, round_number, actor_id)
  - RLS: all SELECT blocked for anon; service role only
  - NOT added to replication publication

- [x] `supabase/migrations/20260403000004_create_werewolf_day_votes.sql`
  - Table: `werewolf_day_votes` (id, room_id FK, round_number, voter_id, target_id, submitted_at)
  - UNIQUE on (room_id, round_number, voter_id)
  - RLS: public SELECT; writes blocked for anon
  - NOT added to replication publication

- [ ] Run `pnpm supabase:push` to apply migrations

---

### Phase 2 — TypeScript Types & Utilities

- [x] `src/types/werewolf.ts`
  - `WerewolfGamePhase` union (9 phases)
  - `WerewolfRole` union
  - `WerewolfRoom`, `WerewolfPlayer`, `NightAction`, `DayVote`
  - `SeerPeekResult`, `VoteTally`, `MyRoleResponse`

- [x] `src/lib/supabase-admin.ts`
  - Service role client using `SUPABASE_SERVICE_ROLE_KEY`
  - Server-side only — never import in client components

- [x] `src/lib/werewolf/roomCodeGenerator.ts`
  - 6-char alphanumeric, exclude confusable chars (0/O, 1/I)

- [x] `src/lib/werewolf/roleAssigner.ts`
  - Shuffle players → assign N werewolves, 1 seer, 1 doctor, rest villagers
  - Follow same pattern as `src/lib/impostor/roleAssigner.ts`

- [x] `src/lib/werewolf/nightResolver.ts`
  - Apply kill/save logic (kill target + doctor protect → saved or eliminated)
  - `checkWinCondition(players)` — pure function, returns winner or null

- [x] `src/lib/werewolf/voteResolver.ts`
  - Tally day votes
  - Handle ties → no elimination
  - Return `{ eliminatedId, tallies }`

---

### Phase 3 — API Routes

All routes use `supabaseAdmin`. Follow pattern from `src/app/api/impostor/words/route.ts`.

- [x] `POST /api/werewolf/rooms` — create room + host player row; returns `{ roomCode, roomId }`
- [x] `GET /api/werewolf/rooms/[code]` — fetch room + players (no role column); used on load/reconnect
- [x] `POST /api/werewolf/rooms/[code]/join` — upsert player (handles reconnect); returns `{ player, isReconnect }`
- [x] `POST /api/werewolf/rooms/[code]/start` — validate host + min 4 players; assign roles; phase → `role_reveal`
- [x] `GET /api/werewolf/rooms/[code]/my-role` — returns `{ role, werewolfAllyNames?, seerPeekHistory? }` for requesting player only
- [x] `POST /api/werewolf/rooms/[code]/night-action` — insert night action; broadcast `night_action_submitted` signal; if seer, return peek result in response body
- [x] `POST /api/werewolf/rooms/[code]/resolve-night` — apply kill/save; update room; phase → `day_announcement`
- [x] `POST /api/werewolf/rooms/[code]/day-vote` — insert vote; if all alive players voted, auto-resolve
- [x] `POST /api/werewolf/rooms/[code]/advance` — host manual phase advance (role_reveal→night, day_announcement→discussion, discussion→day_vote, elimination→night)
- [x] `POST /api/werewolf/rooms/[code]/reset` — host resets room to lobby for another game

---

### Phase 4 — Game Hook

- [x] `src/hooks/useWerewolfGame.ts`
  - Player identity: generate + store `player_id` UUID in `sessionStorage`
  - On mount: check sessionStorage for existing room → silent reconnect
  - Supabase Realtime channel: `werewolf:room:<roomCode>`
    - postgres_changes on `werewolf_rooms` (UPDATE) → sync room state
    - postgres_changes on `werewolf_players` (\*) → sync player roster
    - broadcast `night_action_submitted` → append to signal list
    - presence sync → update online map
  - Phase reaction effect: on phase change, trigger appropriate side effects (fetch role, reset votes, build announcement, etc.)
  - Host auto-resolve night: when `nightActionSignals.length >= expectedNightActors`, fire `resolve-night`
  - Expose all actions: `createRoom`, `joinRoom`, `startGame`, `submitNightAction`, `submitDayVote`, `advancePhase`, `leaveRoom`

---

### Phase 5 — Screen Components

All in `src/components/werewolf/`. Follow pattern from `src/components/impostor/`.

- [x] `WerewolfGame.tsx` — root dispatcher; renders correct screen based on phase
- [x] `JoinScreen.tsx` — enter room code + player name; or create new room
- [x] `LobbyScreen.tsx` — room code display (large, shareable); live player list with presence dots; host sees Start button (disabled if < 4 players)
- [x] `RoleRevealScreen.tsx` — private card flip per device; distinct role illustration + color; "I understand my role" confirm
- [x] `NightScreen.tsx`
  - All players: "close your eyes" mandatory tap (dark atmospheric screen)
  - Werewolf: target selector after tap (alive non-wolf players)
  - Seer: target selector after tap (all alive players)
  - Doctor: target selector after tap (all alive players + self)
  - Villager: passive sleeping screen after tap
- [x] `NightWaitingScreen.tsx` — integrated into NightScreen (post-submit waiting state)
- [x] `DayAnnouncementScreen.tsx` — sunrise reveal animation; eliminated player name or "walang namatay" (no one died); host sees Continue button
- [x] `DiscussionScreen.tsx` — alive player list; host sees Start Vote button
- [x] `DayVoteScreen.tsx` — alive player list; tap to vote; shows submitted state; disabled after voting
- [x] `EliminationScreen.tsx` — dramatic role reveal of eliminated player; vote tally breakdown
- [x] `GameOverScreen.tsx` — winner announcement; full role reveal for all players; Play Again button

---

### Phase 6 — Page & Home Registration

- [x] `src/app/werewolf/page.tsx` — renders `<WerewolfGame />`
- [x] `src/lib/home/games.ts` — add Werewolf entry to `MULTI_GAMES` array

---

### Phase 7 — UI/UX Polish (Do Not Skip)

These are requirements, not enhancements.

- [x] **Role cards** — unique illustrated icon + color per role (wolf 🐺 deep red, seer 👁 deep purple, doctor 🛡 teal, villager silhouette grey)
- [x] **Card flip animation** on role reveal (CSS 3D perspective transform)
- [x] **Night phase atmosphere** — dark `bg-slate-950` background, moon 🌙 motif
- [x] **Day announcement** — sunrise amber theme; tombstone 🪦 for eliminated player; ✅ "safe" banner for no-kill nights
- [x] **Voting tally reveal** — animated bar chart per player
- [x] **Elimination reveal** — 1.8s suspense pause before role is shown
- [x] **Game over** — winner banner with cascade role reveal (1.5s delay)
- [ ] **Phase transitions** — smooth screen-to-screen transitions (fade, slide, or scale), not instant swaps
- [x] **Haptic feedback** (if supported) on confirm taps
- [x] **Typography** — large, readable text for co-located viewing; role names in Filipino where appropriate

---

### Phase 8 — Verification

- [ ] **Lobby sync:** Create room on phone A → join on phones B, C, D → all see live player list
- [ ] **Role privacy:** Start game → each phone shows only its own role; network tab confirms `/my-role` only returns one role
- [ ] **Night phase:** Werewolf phone shows target selector; Villager phone shows waiting — both after mandatory tap
- [ ] **Seer peek:** Seer submits night action → response body contains peek result; no other client receives it
- [ ] **Night resolution:** After all actions submitted → host auto-fires resolve → all phones transition to day_announcement
- [ ] **Doctor save:** Doctor protects kill target → day announcement shows "walang namatay"
- [ ] **Day vote:** All players vote → auto-resolves → elimination phase with tally
- [ ] **Win condition:** All werewolves eliminated → game_over shows villagers win
- [ ] **Reconnection:** Refresh phone mid-game → player restored to current phase with role
- [x] **Lint:** `pnpm lint` passes on all new files

---

## File Summary

### New files

```
src/types/werewolf.ts
src/hooks/useWerewolfGame.ts
src/lib/supabase-admin.ts
src/lib/werewolf/roomCodeGenerator.ts
src/lib/werewolf/roleAssigner.ts
src/lib/werewolf/nightResolver.ts
src/lib/werewolf/voteResolver.ts
src/components/werewolf/WerewolfGame.tsx
src/components/werewolf/JoinScreen.tsx
src/components/werewolf/LobbyScreen.tsx
src/components/werewolf/RoleRevealScreen.tsx
src/components/werewolf/NightScreen.tsx
src/components/werewolf/NightWaitingScreen.tsx
src/components/werewolf/DayAnnouncementScreen.tsx
src/components/werewolf/DiscussionScreen.tsx
src/components/werewolf/DayVoteScreen.tsx
src/components/werewolf/EliminationScreen.tsx
src/components/werewolf/GameOverScreen.tsx
src/app/werewolf/page.tsx
src/app/api/werewolf/rooms/route.ts
src/app/api/werewolf/rooms/[code]/route.ts
src/app/api/werewolf/rooms/[code]/join/route.ts
src/app/api/werewolf/rooms/[code]/start/route.ts
src/app/api/werewolf/rooms/[code]/my-role/route.ts
src/app/api/werewolf/rooms/[code]/night-action/route.ts
src/app/api/werewolf/rooms/[code]/resolve-night/route.ts
src/app/api/werewolf/rooms/[code]/day-vote/route.ts
src/app/api/werewolf/rooms/[code]/advance/route.ts
src/app/api/werewolf/rooms/[code]/reset/route.ts
supabase/migrations/YYYYMMDD_create_werewolf_rooms.sql
supabase/migrations/YYYYMMDD_create_werewolf_players.sql
supabase/migrations/YYYYMMDD_create_werewolf_night_actions.sql
supabase/migrations/YYYYMMDD_create_werewolf_day_votes.sql
```

### Modified files

```
src/lib/home/games.ts       — add Werewolf to MULTI_GAMES
.env.local                  — add SUPABASE_SERVICE_ROLE_KEY
.env.production             — add SUPABASE_SERVICE_ROLE_KEY
```
