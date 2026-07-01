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

Copy `.env.example` to `.env` and fill in every value:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Local Postgres or Supabase → Project Settings → Database → URI |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → your endpoint secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

**Clerk webhook setup:** in your Clerk dashboard, create a webhook pointing to `https://your-domain/api/webhooks/clerk`. Enable the `user.created` and `user.updated` events. For local development use [ngrok](https://ngrok.com) or the Clerk CLI tunnel.

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
| `npm test` | Run unit tests |
| `npm run api:smoke` | Run API smoke tests (server must be running) |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Apply schema changes |

---

## Deployment

Tested for Vercel. The `postinstall` script runs `prisma generate` automatically on deploy. Set all `.env.example` variables in Vercel's environment variables panel. Point your Clerk webhook to your production domain.
