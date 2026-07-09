@AGENTS.md

# The Reading Room — AI Agent Guide

## What this project is

A personal reading workspace built with Next.js 16 App Router. Users save articles, organise them into rooms, highlight passages, and build a vocabulary vault. AI features (chat, synthesis) use Google Gemini via the Vercel AI SDK.

## Tech stack

| Layer     | Choice                                       |
| --------- | -------------------------------------------- |
| Framework | Next.js 16.2.9 (App Router, Turbopack)       |
| Language  | TypeScript 5 (strict mode)                   |
| Auth      | Clerk (`@clerk/nextjs` v7)                   |
| Database  | PostgreSQL via Prisma 7                      |
| AI        | `@ai-sdk/google` (Gemini)                    |
| UI        | Tailwind CSS 4 + Base UI + custom components |
| Toast     | Sonner                                       |

## Directory structure — what goes where

```
app/              Next.js App Router — ALL new pages and API routes go here
app/(dashboard)/  Protected pages behind sidebar layout
app/api/          REST API endpoints — auth-gated with Clerk
components/       Reusable UI components
components/ui/    Base UI primitives (Button, Dialog, Input, etc.)
lib/              Root re-exports so @/* imports resolve correctly
src/lib/          Actual implementation (Prisma client, type definitions)
prisma/           Schema and migrations
proxy.ts          Middleware (Clerk auth guard) — see note below
src/app/api/      LEGACY — old in-memory routes, do not add code here
```

## Critical gotchas

### 1. Middleware is proxy.ts, not middleware.ts

Next.js 16 uses `proxy.ts` as the middleware filename in this project. Do not create a `middleware.ts` — it will conflict.

### 2. @/* path alias resolves to the project root

`tsconfig.json` sets `"@/*": ["./*"]`. So `@/lib/prisma` resolves to `./lib/prisma.ts` (the re-export shim), NOT `./src/lib/prisma.ts`. Always import Prisma as `import prisma from '@/lib/prisma'`.

### 3. src/app/api/ is dead code

The original scaffold left routes in `src/app/api/`. Next.js ignores them (the active app is at `app/`). Do not modify those files; they exist only to satisfy TypeScript.

### 4. Tailwind CSS v4

This project uses Tailwind v4, which has no `tailwind.config.js`. Configuration is CSS-first in `app/globals.css`. Do not create a config file.

### 5. Google Fonts are loaded server-side

Fonts (`Inter`, `Source_Serif_4`, `Geist_Mono`) are imported in `app/layout.tsx` via `next/font/google` and exposed as CSS variables (`--font-inter`, `--font-source-serif`, `--font-geist-mono`). Do not add `<link>` tags for fonts.

## API route pattern

Every protected API route follows this exact pattern — never deviate:

```typescript
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // All DB queries MUST be scoped to user.id — never return cross-user data
  const data = await prisma.room.findMany({ where: { user_id: user.id } });
  return NextResponse.json(data);
}
```

Key rule: `userId` from Clerk is a string like `user_abc123`. The internal DB `user.id` is a UUID. Always look up the internal user first; never use `clerk_id` directly in relations.

## Database models (summary)

```
User (clerk_id, email, name, tier)
  └─ Room (name, description, cover_color, mode)
       └─ Article (title, source_url, content, reading_progress, status)
            └─ Highlight (content, colour, note, position_start, position_end)
  └─ VaultEntry (term, type, definition, pronunciation, etymology)
       └─ VaultTrail (links VaultEntry ↔ Article ↔ Room)
```

All relations cascade-delete downward. `cover_color` on Room defaults to `#F4F4F5`.

## User sync

The Clerk webhook at `app/api/webhooks/clerk/route.ts` creates and updates `User` rows automatically when users sign up or change their profile. Do not manually create users anywhere else.

## Onboarding flow

After sign-up, Clerk redirects to `/onboarding`. On completion the user lands at `/home` (the dashboard). The middleware protects all `/dashboard` routes — if no `User` row exists, API routes return 404; handle this case in the UI.

## What is and isn't built

**Done:**

- Clerk auth, protected routes, webhook user sync
- Room CRUD (create, list, get, update, delete)
- Article CRUD + URL ingestion (Readability) + PDF ingestion
- Highlights (create, list, delete)
- Vocabulary vault (create, list)
- Global search (Cmd+K)
- AI chat per room (Gemini)
- Room export
- Dashboard pages: Home, Library, Rooms, Vault, Archive, Insights

**Not built (V2 scope):**

- Billing / Pro tier enforcement
- Collaborative rooms
- Mobile app
- Browser extension
