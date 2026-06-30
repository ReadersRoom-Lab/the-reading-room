# The Reading Room Backend Handoff

## Vision
The Reading Room V1.0 is a free-tier reading workspace where users can save articles, organize them into rooms, highlight text, save vocabulary, search their archive, and view insights.

## Current status
- A Next.js + TypeScript app has been scaffolded.
- The backend currently uses an in-memory store for development and testing.
- Core REST endpoints exist for rooms, articles, highlights, and health.
- A regression test validates the current store behavior.

## What to build next
1. Persist data with Prisma + Supabase.
2. Add Clerk authentication and protected routes.
3. Implement article ingestion from URLs using Readability.
4. Build user-scoped CRUD for articles and rooms.
5. Add vault and archive APIs.

## Suggested file map
- src/app/api/rooms/route.ts — room endpoints
- src/app/api/articles/route.ts — article endpoints
- src/app/api/highlights/route.ts — highlight endpoints
- src/lib/store.ts — current temporary store layer

## Verification commands
- npm test
- npm run build

## Notes for the next developer or AI
Keep the implementation aligned to the V1.0 plan from the PDF. Avoid adding billing, PDF ingestion, or research-room features in this phase.
