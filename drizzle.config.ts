import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  /* 
  dbCredentials: {
    wranglerConfigPath: 'wrangler.toml',
    dbName: 'expense-tracker-db',
  },
  */
});
