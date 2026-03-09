import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./database/drizzle/schema/*",
  out: "./database/migrations",
});
