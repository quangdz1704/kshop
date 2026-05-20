import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL ?? "";
const isPostgres = /^(postgres|postgresql):\/\//.test(databaseUrl);
const cliDatabaseUrl = process.env.DIRECT_URL ?? databaseUrl;

export default defineConfig({
  schema: isPostgres ? "prisma/schema.postgres.prisma" : "prisma/schema.prisma",
  migrations: {
    path: isPostgres ? "prisma/migrations-postgres" : "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: cliDatabaseUrl || env("DATABASE_URL"),
  },
});
