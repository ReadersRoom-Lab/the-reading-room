import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as { prisma2?: PrismaClient };

function getTcpUrl(url: string | undefined) {
  if (!url) return undefined;
  if (url.startsWith("prisma+postgres://")) {
    try {
      const urlObj = new URL(url);
      const apiKey = urlObj.searchParams.get("api_key");
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString("utf-8"));
        return decoded.databaseUrl;
      }
    } catch (e) {
      logger.error("Failed to parse api_key", e);
    }
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma2) {
    const PrismaCtor = PrismaClient as unknown as new (...args: unknown[]) => PrismaClient;
    const tcpUrl = getTcpUrl(process.env.DATABASE_URL);
    if (tcpUrl) {
      const pool = new Pool({ connectionString: tcpUrl });
      const adapter = new PrismaPg(pool);
      globalForPrisma.prisma2 = new PrismaCtor({ adapter });
    } else {
      globalForPrisma.prisma2 = new PrismaCtor({
        datasourceUrl: "postgres://dummy:dummy@dummy:5432/dummy",
      });
    }
  }

  return globalForPrisma.prisma2;
}

const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (prop === "then") return undefined; // Prevent Promise chaining issues
    const client = createPrismaClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function getPrisma(): PrismaClient {
  return createPrismaClient();
}

export default prisma;
