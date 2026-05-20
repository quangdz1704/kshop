import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

function resolveSqliteUrl(url: string): string {
  if (!url.startsWith("file:")) return url;
  const filePath = url.replace(/^file:/, "");
  if (path.isAbsolute(filePath)) return url;
  return `file:${path.join(process.cwd(), filePath)}`;
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const isPostgres = /^(postgres|postgresql):\/\//.test(databaseUrl);
  const adapter = isPostgres
    ? new PrismaPg({ connectionString: databaseUrl })
    : new PrismaBetterSqlite3({ url: resolveSqliteUrl(databaseUrl) });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
