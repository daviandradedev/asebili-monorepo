import { cache } from "react";
import { headers } from "next/headers";
import { readSession } from "./auth";

export const getServerSession = cache(async () => {
  if (!process.env.AUTH_DATABASE_URL?.trim() || !process.env.BETTER_AUTH_SECRET?.trim()) {
    return null;
  }
  return readSession(await headers());
});
