import { desc, eq } from "drizzle-orm";
import { activities, classActivities, classes } from "@asebili/database/schema";
import { db } from "../../../../../lib/db";
import {
  publicJson,
  publicJsonError,
  publicOptions,
} from "../../../../../lib/public-api-http";
import {
  normalizeAccessCode,
  toPublicActivity,
  toPublicClass,
} from "../../../../../lib/server-utils";

export const runtime = "nodejs";

export function OPTIONS() {
  return publicOptions();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const accessCode = normalizeAccessCode(code);

  if (accessCode.length < 4) {
    return publicJsonError("Invalid class code.");
  }

  const [classRow] = await db
    .select()
    .from(classes)
    .where(eq(classes.accessCode, accessCode))
    .limit(1);

  if (!classRow) {
    return publicJsonError("Class not found.", 404);
  }

  const activityRows = await db
    .select({ activity: activities })
    .from(classActivities)
    .innerJoin(activities, eq(activities.id, classActivities.activityId))
    .where(eq(classActivities.classId, classRow.id))
    .orderBy(desc(activities.createdAt));

  return publicJson({
    class: toPublicClass(classRow),
    activities: activityRows.map(({ activity }) => toPublicActivity(activity)),
  });
}
