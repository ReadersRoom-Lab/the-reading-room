# Backend Handoff

## Product context

The Reading Room is a personal reading and knowledge workspace for casual readers. V1.0 focuses on a free-tier experience with article saving, rooms, highlights, vault entries, archive search, and insights.

## Current implementation status

- Next.js + TypeScript app scaffolded
- Basic in-memory store implemented for rooms, articles, and highlights
- Initial API endpoints available for rooms, articles, highlights, and health
- Regression test exists and passes

## Next implementation priorities

1. Replace the in-memory store with Prisma + Supabase.
2. Add Clerk authentication and user-scoped routes.
3. Implement article ingestion with Readability.
4. Add room and article CRUD with persistence.
5. Add vault and archive endpoints.

## Working conventions

- Keep API routes under src/app/api.
- Keep shared domain logic in src/lib.
- Prefer small, testable modules.
- Keep the implementation aligned with the V1.0 plan in the PDF.
