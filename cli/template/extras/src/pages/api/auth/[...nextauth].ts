import { type NextRequest } from "next/server";

import { GET as getHandler, POST as postHandler } from "~/server/auth";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  if (req.method === "GET") {
    console.log("RAN GET");
    return getHandler(req);
  } else if (req.method === "POST") {
    console.log("RAN POST");
    return postHandler(req);
  } else {
    return new Response("Method not allowed", { status: 405 });
  }
}
