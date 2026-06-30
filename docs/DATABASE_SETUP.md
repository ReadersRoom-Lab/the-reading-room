# Database setup for The Reading Room

## Local PostgreSQL
Use a local PostgreSQL instance or a free managed database such as Supabase.

### Example local connection string
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/readers_room"
```

### Apply migrations
```bash
npx prisma migrate dev --name init
```

### Generate Prisma client
```bash
npx prisma generate
```

## Notes
The Prisma schema already includes the V1.0 models for users, rooms, articles, highlights, vault entries, and vault trails.
