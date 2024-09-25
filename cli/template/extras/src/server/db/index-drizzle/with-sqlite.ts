/**
 * To run on Cloudflare, we must use @libsql/client/web the non-web import will not work in Workers
 * environment.
 *
 * @see https://developers.cloudflare.com/workers/databases/native-integrations/turso/
 */
import { createClient, type Client } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client =
  globalForDb.client ?? createClient({ url: env.DATABASE_URL });
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
