import { readSession } from "./auth";

export async function getCurrentUser(request: Request) {
  const session = await readSession(request.headers);
  return session?.user ?? null;
}
