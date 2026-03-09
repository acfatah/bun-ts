// https://vike.dev/data

import * as drizzleQueries from "../../database/drizzle/queries/todos";
import type { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(_pageContext: PageContextServer) {
  const todoItemsInitial = await drizzleQueries.getAllTodos(_pageContext.db);

  return { todoItemsInitial };
}
