import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null };

// Lazily construct PrismaClient only when a DATABASE_URL is present.
// This prevents build-time initialization errors when the DB is not configured.
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;

  if (!globalForPrisma.prisma) {
    const PrismaCtor = PrismaClient as unknown as new (...args: unknown[]) => PrismaClient;
    // Construct with no args; Prisma config file will supply the datasource.
    globalForPrisma.prisma = new PrismaCtor();
  }

  return globalForPrisma.prisma;
}
