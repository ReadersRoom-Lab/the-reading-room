# Database setup — The Reading Room

## Option A: Local PostgreSQL

```bash
# Create the database
createdb readers_room

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/readers_room"
```

## Option B: Supabase (recommended for quick setup)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the URI and set it as `DATABASE_URL` in `.env`

## Apply migrations

Run this once after setting `DATABASE_URL`:

```bash
npx prisma migrate dev --name init
```

For subsequent schema changes:

```bash
npx prisma migrate dev --name describe_your_change
```

## Generate Prisma client

This runs automatically on `npm install` via the `postinstall` script. To run manually:

```bash
npx prisma generate
```

## Inspect the database

```bash
npx prisma studio
```

Opens a GUI at `http://localhost:5555`.

## Data models

```
User          clerk_id, email, name, tier (free/pro)
  └─ Room     name, description, cover_color, mode
       └─ Article   title, source_url, content, status, reading_progress
            └─ Highlight   content, colour (amber/teal/coral), note, position
  └─ VaultEntry   term, type, definition, pronunciation, etymology
       └─ VaultTrail   links a VaultEntry back to the Article where it was found
```

All child records cascade-delete when their parent is deleted.

## Seed data

`prisma/seed.ts` exists but is not yet wired to a seed script. To run it manually after filling in a valid user ID:

```bash
npx tsx prisma/seed.ts
```

## Production (Vercel)

Set all environment variables in the Vercel dashboard. The `postinstall` script handles `prisma generate` automatically on every deploy. For migrations in production, run:

```bash
DATABASE_URL="<prod-url>" npx prisma migrate deploy
```
