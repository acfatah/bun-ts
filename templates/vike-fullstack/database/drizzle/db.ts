import { drizzle as drizzleD1 } from "drizzle-orm/d1";

export function dbD1(d1: D1Database) {
  return drizzleD1(d1);
}
