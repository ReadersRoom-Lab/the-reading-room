import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const PrismaCtor = PrismaClient as unknown as new (...args: unknown[]) => PrismaClient;
    globalForPrisma.prisma = new PrismaCtor();
  }

  return globalForPrisma.prisma;
}

const prisma = createPrismaClient();

export function getPrisma(): PrismaClient {
  return prisma;
}

export default prisma;
