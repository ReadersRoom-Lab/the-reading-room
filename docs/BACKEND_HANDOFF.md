# Backend Handoff — The Reading Room

## Current status (V1.0 feature-complete)

All V1.0 backend features are implemented and wired to the frontend:

| Feature | Status | Location |
|---|---|---|
| Clerk authentication | Done | `proxy.ts`, `app/api/webhooks/clerk/` |
| User sync (webhook) | Done | `app/api/webhooks/clerk/route.ts` |
| Room CRUD | Done | `app/api/rooms/` |
| Room export | Done | `app/api/rooms/[id]/export/` |
| Article CRUD | Done | `app/api/articles/` |
| URL ingestion (Readability) | Done | `app/api/articles/save/` |
| PDF ingestion | Done | `app/api/articles/pdf/` |
| Highlights | Done | embedded in article routes |
| Vocabulary vault | Done | `app/api/vault/` |
| Dictionary lookup | Done | `app/api/dictionary/` |
| Global search (Cmd+K) | Done | `app/api/search/` |
| AI chat (Gemini) | Done | `app/api/chat/` |
| Dashboard pages | Done | `app/(dashboard)/` |
| Reader view | Done | `app/read/[id]/` |
| Onboarding | Done | `app/onboarding/` |

## Architecture

### Auth pattern

Every protected API route:
1. Calls `auth()` from `@clerk/nextjs/server` → gets Clerk `userId` string
2. Looks up internal `User` by `clerk_id`
3. Scopes **all** DB queries to `user.id` (internal UUID — not the Clerk ID)

```typescript
const { userId } = await auth()
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const user = await prisma.user.findUnique({ where: { clerk_id: userId } })
if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

// always scope to user.id
const rooms = await prisma.room.findMany({ where: { user_id: user.id } })
```

### User creation

Users are created by the Clerk webhook (`user.created` event) at `app/api/webhooks/clerk/route.ts` — not by any API route directly. If a user hits an API route before the webhook fires, they get a 404. The frontend handles this by redirecting to `/onboarding`.

### Database

PostgreSQL via Prisma 7. Client is a singleton in `src/lib/prisma.ts`, re-exported from `lib/prisma.ts` so that the `@/*` path alias resolves correctly. The `postinstall` script in `package.json` runs `prisma generate` automatically on every `npm install` (Vercel deploys included).

### AI features

Google Gemini via `@ai-sdk/google`. The chat route uses streaming. Requires `GOOGLE_GENERATIVE_AI_API_KEY` in `.env`.

## What's left for V2

These were explicitly out of scope for V1.0:

- **Pro tier / billing** — the `tier` field exists on `User` but no enforcement logic is built
- **Collaborative rooms** — currently single-user only
- **Mobile app** — web only
- **Browser extension** — web only
- **Advanced insights** — the Insights page is a scaffold; deeper AI synthesis is V2

## File map

```
proxy.ts                          Clerk middleware — defines public routes
app/api/webhooks/clerk/route.ts   User sync from Clerk events
app/api/rooms/route.ts            GET (list) / POST (create)
app/api/rooms/[id]/route.ts       GET / PATCH / DELETE
app/api/rooms/[id]/export/        Export room contents
app/api/articles/route.ts         GET (list)
app/api/articles/save/route.ts    POST — ingest from URL (Readability)
app/api/articles/pdf/route.ts     POST — ingest from PDF
app/api/articles/[id]/route.ts    GET / PATCH / DELETE
app/api/articles/[id]/room/       PATCH — assign article to room
app/api/articles/recent/          GET — in-progress articles
app/api/vault/route.ts            GET / POST vault entries
app/api/chat/route.ts             POST — streaming Gemini chat
app/api/dictionary/route.ts       GET — word definition lookup
app/api/search/route.ts           GET — full-text search across articles
app/api/user/route.ts             GET / PATCH user profile
src/lib/prisma.ts                 Prisma client singleton
prisma/schema.prisma              Full data model
```

## Verification

```bash
npm test            # unit tests
npm run api:smoke   # smoke tests (run npm run dev first)
npx tsc --noEmit    # TypeScript check
```
