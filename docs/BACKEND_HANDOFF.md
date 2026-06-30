# The Reading Room Backend Handoff

## Vision
The Reading Room V1.0 is a free-tier reading workspace where users can save articles, organize them into rooms, highlight text, save vocabulary, search their archive, and view insights.

## Current status
- A Next.js + TypeScript app has been scaffolded.
- Core REST endpoints exist for rooms, articles, highlights, and health.
- Prisma schema has been defined and the Prisma client was generated.
- The store supports optional database persistence with a fallback to in-memory storage for dev.
- A regression test validates the current store behavior.

## What to build next
1. Add Clerk authentication and protected routes.
2. Implement article ingestion from URLs using Readability.
3. Build user-scoped CRUD for rooms and articles.
4. Add vault and archive APIs.
5. Harden database persistence and production deployment.

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
