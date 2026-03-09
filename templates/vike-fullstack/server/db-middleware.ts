import { getDbFromRuntime } from "../database/d1/helpers";
import { dbD1 } from "../database/drizzle/db";
import { enhance, type UniversalMiddleware } from "@universal-middleware/core";

declare global {
  namespace Universal {
    interface Context {
      db: ReturnType<typeof dbD1>;
    }
  }
}

// Note: You can directly define a server middleware instead of defining a Universal Middleware. (You can remove @universal-middleware/* — Vike's scaffolder uses it only to simplify its internal logic, see https://github.com/vikejs/vike/discussions/3116)
/**
 * Add the `db` object to the context.
 */
export const dbMiddleware: UniversalMiddleware = enhance(
  // The context we add here is automatically merged into pageContext
  async (_request, context, _runtime) => {
    const db = dbD1(await getDbFromRuntime(_runtime));

    return {
      ...context,
      // Sets pageContext.db
      db: db,
    };
  },
  {
    name: "my-app:db-middleware",
    immutable: false,
  },
);
