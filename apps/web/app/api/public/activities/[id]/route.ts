import { eq } from "drizzle-orm";
import { activities } from "@asebili/database/schema";
import { db } from "../../../../../lib/db";
import {
  publicJson,
  publicJsonError,
  publicOptions,
} from "../../../../../lib/public-api-http";
import { toPublicActivity } from "../../../../../lib/server-utils";

export const runtime = "nodejs";

export function OPTIONS() {
  return publicOptions();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);

  if (!activity) {
    return publicJsonError("Activity not found.", 404);
  }

  return publicJson({ activity: toPublicActivity(activity) });
}
