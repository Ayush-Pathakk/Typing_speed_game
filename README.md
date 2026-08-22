# Typing Speed Game

A full-stack typing speed test. Users complete a sequence of 20 randomly
generated letters as fast and accurately as possible — each incorrect
keypress adds a 0.5s penalty to the final time. Lower total time is a
better score. Best scores are tracked locally per browser and globally
on a server-side leaderboard.

---

## Tech Stack

| Layer      | Technology                                  |
|------------|----------------------------------------------|
| Frontend   | React + Vite, TypeScript, graphql-request     |
| Backend    | Bun, TypeScript, GraphQL Yoga                 |
| Database   | PostgreSQL, Prisma ORM                        |
| Auth       | JWT (Bearer token), bcrypt password hashing   |
| Infra      | Docker Compose (PostgreSQL)                   |
| Testing    | `bun test` (backend + frontend logic)         |

---

## Prerequisites

- [Bun](https://bun.sh) v1.4+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- Node 18+ is not required — Bun handles both runtime and package management

---

## Getting Started

### 1. Clone and configure environment

```bash
git clone <your-repo-url>
cd typing-speed-game
cp .env.example backend/.env
```

Open `backend/.env` and confirm the `DATABASE_URL` port matches your
`docker-compose.yml` (see [Port conflicts](#port-conflicts) below if
you already run PostgreSQL locally).

### 2. Start PostgreSQL

```bash
docker compose up -d
docker compose ps   # confirm the postgres container is "running"
```

### 3. Set up and run the backend

```bash
cd backend
bun install
bunx prisma migrate dev
bun run src/index.ts
```

The GraphQL server starts at **http://localhost:4000/graphql**, which
also serves an interactive GraphiQL playground.

### 4. Set up and run the frontend

In a new terminal:

```bash
cd frontend
bun install
bun run dev
```

The app runs at **http://localhost:5173**.

---

## Port Conflicts

If you already have a local PostgreSQL installation running, it will
occupy port `5432` and the Docker container will silently fail to
receive connections (you'll see `P1000: Authentication failed` even
with correct credentials — this is actually a port collision, not a
credentials issue).

This repo's `docker-compose.yml` maps PostgreSQL to host port **5433**
by default to avoid that conflict. If `5433` is also unavailable,
change the port mapping in `docker-compose.yml` and update
`DATABASE_URL` in `backend/.env` to match.

---

## Running Tests

```bash
# Backend (auth, validation, persistence, leaderboard ordering)
cd backend
bun test

# Frontend (penalty calculation, high-score comparison, game logic)
cd frontend
bun test
```

**Coverage:**
- Password hashing and JWT signing/verification
- User registration and login, including duplicate/invalid-input rejection
- Authenticated vs. unauthenticated access control
- Game result validation (non-negative values, penalty must match wrong attempts × 500ms, full 20-character completion required)
- Best score, game history, and leaderboard query correctness
- Leaderboard ordering (ascending by best time)
- Typing game penalty math and completion logic
- Local high-score comparison logic

---

## Project Structure

```
typing-speed-game/
├── backend/
│   ├── src/
│   │   ├── index.ts       # GraphQL Yoga server entrypoint
│   │   ├── schema.ts       # GraphQL typeDefs + resolvers
│   │   ├── auth.ts         # Password hashing, JWT sign/verify
│   │   ├── db.ts           # Prisma client (driver adapter setup)
│   │   ├── schema.test.ts  # Resolver integration tests
│   │   └── auth.test.ts    # Auth unit tests
│   ├── prisma/
│   │   └── schema.prisma   # User, GameResult models
│   └── prisma.config.ts    # Prisma 7 datasource config
├── frontend/
│   └── src/
│       ├── components/      # AuthScreen, GameScreen, ResultScreen, Leaderboard
│       ├── context/          # AuthContext (React Context-based auth state)
│       └── lib/               # graphql client, queries, game logic, local storage
├── docker-compose.yml
├── .env.example
├── ARCHITECTURE.md
├── CONVENTIONS.md
└── PROGRESS.md
```

---

## GraphQL API

All operations are exposed on a single endpoint: `POST /graphql`.
Authenticated operations require an `Authorization: Bearer <token>` header.

| Operation                | Type     | Auth required |
|---------------------------|----------|----------------|
| `register(username, password)` | Mutation | No             |
| `login(username, password)`    | Mutation | No             |
| `me`                             | Query    | Yes            |
| `saveGameResult(...)`           | Mutation | Yes            |
| `gameHistory`                   | Query    | Yes            |
| `bestScore`                     | Query    | Yes            |
| `leaderboard`                   | Query    | No             |

Full schema is browsable via the GraphiQL playground at
`http://localhost:4000/graphql` once the backend is running.

---

## Key Design Decisions

- **No router.** The app has four views (auth, menu, game, result,
  leaderboard) managed by a single state variable — simpler than
  introducing `react-router` at this scale.
- **React Context for auth state** — avoids an external state
  management dependency for a single piece of shared state.
- **Local storage is authoritative for Success/Failure.** The
  assignment specifies "store the best score locally," so the
  Success/Failure comparison uses `localStorage`, not a round trip to
  the server. The result is saved to the backend afterward,
  fire-and-forget, so a network hiccup never blocks the result screen.
- **Leaderboard deduplication** happens in a single query — all
  results are fetched sorted by time ascending, and the first (best)
  result per user is kept in application code. This avoids a separate
  `GROUP BY` round trip at this data scale.
- **Timer accuracy.** Elapsed time is computed from `Date.now()`
  deltas at game start/finish, not accumulated from `setInterval`
  ticks, which avoids drift. The final submitted time comes from a
  single calculation at completion; the on-screen timer is
  display-only.
- **Server-side result validation** guards against a tampered client:
  `saveGameResult` rejects incomplete games (`correctChars` must equal
  20) and requires `penaltyMs === wrongAttempts * 500`.
- **Game logic extracted into pure functions** (`lib/game.ts`,
  `lib/localBest.ts`) rather than left inline in components, so
  penalty calculation and high-score comparison are directly
  unit-testable.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown,
including known simplifications made under the project's time/scope
constraints.

---

## Known Limitations

- JWTs are long-lived (7 days) with no refresh/rotation mechanism.
- No rate limiting on authentication endpoints.
- Only PostgreSQL runs in Docker; the frontend and backend run via
  `bun run` locally rather than being containerized (listed as a
  bonus/optional item in the assignment spec).
- `DateTime` fields are returned as raw epoch timestamps in GraphQL
  responses rather than ISO strings; no current UI consumes them
  directly.

These are documented trade-offs made to keep the implementation
focused on the assignment's core requirements rather than
over-engineering for a take-home scope.
