# The Reading Room

A personal reading and knowledge workspace. Save articles from the web, organise them into rooms, highlight key passages, build a vocabulary vault, and surface insights with AI.

**Stack:** Next.js 16 · React 19 · TypeScript · Prisma 7 · PostgreSQL · Clerk · Tailwind CSS 4 · Google AI SDK

---

## Quick start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Supabase](https://supabase.com) free tier)
- [Clerk](https://clerk.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com) API key (free tier)

### 2. Clone and install

```bash
git clone https://github.com/ReadersRoom-Lab/the-reading-room
cd the-reading-room
npm install
```

### 3. Environment variables

The `.env` file already exists but has placeholders. You need real values for:

- **`DATABASE_URL`** — easiest option: create a free Supabase project → Project Settings → Database → Connection string (URI)
- **`CLERK_SECRET_KEY`** and **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** — create a free app at clerk.com → API Keys
- **`CLERK_WEBHOOK_SECRET`** — in Clerk dashboard → Webhooks → create an endpoint pointing to your domain (for local dev, skip this initially — sign-up will work but user sync won't fire)
- **`GOOGLE_GENERATIVE_AI_API_KEY`** — [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free)

### 4. Database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Run

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Project structure

```
readers-room/
├── app/                        # Next.js App Router (primary)
│   ├── (dashboard)/            # Protected pages — sidebar layout
│   │   ├── home/               # Dashboard landing
│   │   ├── library/            # Saved articles
│   │   ├── rooms/              # Reading rooms
│   │   ├── vault/              # Vocabulary vault
│   │   ├── archive/            # Archived articles
│   │   └── insights/           # AI synthesis view
│   ├── api/                    # REST API endpoints
│   │   ├── articles/           # Article CRUD + save/PDF ingestion
│   │   ├── rooms/              # Room CRUD + export
│   │   ├── chat/               # AI chat (Google Gemini)
│   │   ├── dictionary/         # Word lookup
│   │   ├── search/             # Global search
│   │   ├── user/               # User profile
│   │   ├── vault/              # Vocabulary vault entries
│   │   └── webhooks/clerk/     # Clerk user sync
│   ├── read/[id]/              # Full article reader
│   ├── onboarding/             # Post sign-up onboarding
│   ├── sign-in/ sign-up/       # Clerk auth pages
│   └── page.tsx                # Public landing page
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Base UI primitives (Button, Dialog, etc.)
│   ├── ArticleCard.tsx
│   ├── GlobalSearchDialog.tsx
│   ├── SaveArticleDialog.tsx
│   ├── CreateRoomDialog.tsx
│   └── ...
│
├── lib/                        # Root-level re-exports (used by @/* alias)
│   ├── prisma.ts               # Re-exports from src/lib/prisma
│   ├── store.ts                # Re-exports from src/lib/store
│   └── utils.ts                # cn() utility
│
├── src/lib/                    # Core library code
│   ├── prisma.ts               # Prisma client singleton
│   └── store.ts                # Type definitions (Room, Article, Highlight, etc.)
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── proxy.ts                    # Clerk middleware (Next.js 16: named proxy.ts)
├── docs/                       # Developer documentation
└── scripts/                    # API smoke tests
```

---

## Authentication flow

All routes are protected by Clerk via `proxy.ts` (the middleware file). Public routes are:

- `/` — landing page
- `/sign-in`, `/sign-up`
- `/api/webhooks/clerk`

Every API route starts with `auth()` from `@clerk/nextjs/server`, then looks up the internal `User` record by `clerk_id`. The Clerk webhook at `/api/webhooks/clerk` creates/syncs `User` rows when accounts are created or updated.

---

## Database

Six Prisma models: **User → Room → Article → Highlight**, **VaultEntry → VaultTrail**.

All queries are scoped to `user.id` — the internal UUID, not the Clerk `userId`. Pattern used in every API route:

```typescript
const { userId } = await auth()                          // Clerk ID
const user = await prisma.user.findUnique({
  where: { clerk_id: userId }                            // internal User
})
const rooms = await prisma.room.findMany({
  where: { user_id: user.id }                            // scoped to user
})
```

See `docs/DATABASE_SETUP.md` for migration and seeding steps.

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Production build (requires real DATABASE_URL) |
| `npm test` | Run unit tests (using Node's native `node:test` runner) |
| `npm run api:smoke` | Run API smoke tests (server must be running) |
| `npm run coverage` | Run unit tests with C8 test coverage reporting |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Apply schema changes |

---

## Code Quality & CI

The project uses **SonarCloud** for continuous code quality inspection. The configuration is found in `sonar-project.properties`.

- Test coverage is generated via the Node.js native `node:test` framework combined with C8 coverage reporting.
- Next.js UI components and API route files (`app/**` and `components/**`) are excluded from the test coverage requirements because they require separate E2E testing strategies.
- To view code smells or coverage metrics, check the SonarCloud Quality Gate dashboard.

---

## UI / UX Aesthetic

The app uses a custom **"Scholarly Minimalism"** (Parchment & Ink) aesthetic:
- A `0px` border-radius policy on all interactive elements (buttons, inputs, cards).
- Flat backgrounds with simple ink borders instead of heavily layered drop-shadows.
- Typography prioritizes high legibility with classic serif reading options and crisp sans-serif menus.
- Consistent metadata trailing borders to group related information intuitively.

---

## Features Log (Implemented)

1. **Onboarding Flow & Enforcement**:
   - Multi-step client onboarding flow capturing Name and positive Goals, creating the user's first Room.
   - Layout-level enforcement restricting access to the dashboard until onboarding is complete.
   - Development fallback automatically registering the Clerk user in Prisma on database mismatch.
2. **Room Management & Curated Shelves**:
   - Create, update name/description, and permanently delete rooms (moving items to library).
   - Dynamic highlights count aggregated and displayed in the Room view.
   - Room exporting to Markdown downloads (including articles and highlighted quotes).
3. **Reader & Wikipedia Concept Lookup**:
   - Custom memoized selection hook to prevent React 19 re-rendering from clearing highlight selections.
   - Popover dictionary with Wikipedia REST integration to dynamically fetch definitions, thumbs, and desktop page backlinks.
4. **Insights Studio Dashboard**:
   - Stats compiler endpoint (`/api/insights/stats`) calculating reading streak history (current vs longest streak).
   - 365-day contribution heatmap grid, custom SVG Knowledge Growth line chart, and horizontal active rooms bar chart.

---

## Recommended Next Steps for Developers

1. **Vector Search & RAG Integration**:
   - Connect the AI chat in the **Synthesis Engine** to a vector store (e.g. pgvector) containing chunked article content and highlighted passages.
2. **Social Reading Rooms**:
   - Add a collaborative mode to rooms allowing users to invite others, share highlights, and discuss articles.
3. **Highlight Customizer**:
   - Allow users to customize highlight colors (e.g. Sage, Crimson, Ochre) and tag highlights with custom metadata.

---

## Deployment

Tested for Vercel. The `postinstall` script runs `prisma generate` automatically on deploy. Set all `.env.example` variables in Vercel's environment variables panel. Point your Clerk webhook to your production domain.
