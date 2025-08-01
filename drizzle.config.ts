import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    driver: "d1-http",
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
        token: process.env.CLOUDFLARE_D1_TOKEN!,
    }
});