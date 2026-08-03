import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

const globalDatabase = globalThis as typeof globalThis & { sourceBlendrPrisma?: PrismaClient };

export function getDatabase(): PrismaClient {
  if (globalDatabase.sourceBlendrPrisma) return globalDatabase.sourceBlendrPrisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL_required");

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  if (process.env.NODE_ENV !== "production") globalDatabase.sourceBlendrPrisma = client;
  return client;
}
