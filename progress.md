# Progress

## Done
- M0: Repo scaffold, Docker Compose (Postgres on port 5433 due to local Postgres conflict), backend/frontend init.
- M1: Backend skeleton — GraphQL Yoga server, Prisma schema (User, GameResult), driver adapter setup (Prisma 7 requires @prisma/adapter-pg).
- M2: Auth — register/login mutations, bcrypt password hashing, JWT (7d expiry), `me` query, context-based auth via Bearer header. 8 tests passing (bun test).

## Next
- M3: Game result persistence — saveGameResult mutation, auth-guarded.

## Notes
- Local Postgres service (postgresql-x64-17) was already running on 5432 — Docker Postgres remapped to 5433 to avoid conflict. Remember this if setting up on a clean machine, port may differ.
- Prisma 7 config lives in prisma.config.ts, not schema.prisma (breaking change from v6).

## Done
- M0, M1, M2, M3 (see above)
- M3.5: saveGameResult validation — non-negative values, correctChars must be 20, penaltyMs must equal wrongAttempts*500. 15 tests passing.

## Next
- M4: Frontend skeleton

## Done
- M0–M7: full app — auth, game loop, persistence, leaderboard, retro UI polish.
- Frontend logic extracted to lib/game.ts and lib/localBest.ts for testability.
- Tests: 15 backend (bun test), 7 frontend (bun test) — 22 total. Covers auth,
  penalty calc, game completion, high-score calc, leaderboard ordering, persistence.

## Status: feature-complete against assignment spec.