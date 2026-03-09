import { dbD1 } from "./database/drizzle/db";
declare global {
  namespace Vike {
    interface PageContextServer {
      env: Env;
    }
  }
}

declare global {
  namespace Vike {
    interface PageContextServer {
      db: ReturnType<typeof dbD1>;
    }
  }
}

export {};
