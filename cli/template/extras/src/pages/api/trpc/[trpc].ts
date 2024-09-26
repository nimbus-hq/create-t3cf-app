import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export const config = {
  runtime: "edge",
};

/**
 * Configuring handler to be Cloudflare compatible.
 *
 * @see https://trpc.io/docs/server/adapters/fetch#create-cloudflare-worker
 */
async function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });
}

export default handler;
