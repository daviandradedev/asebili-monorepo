import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { activities, classActivities, classes } from "@asebili/database/schema";
import {
  parseActivityPayload,
  type ActivityPayloadBody,
} from "../../../../lib/activity-payload";
import { getCurrentUser } from "../../../../lib/api-auth";
import { db } from "../../../../lib/db";
import { jsonError, readJson } from "../../../../lib/http";
import { toDashboardActivity } from "../../../../lib/server-utils";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getOwnedActivity(instructorId: string, activityId: string) {
  const [row] = await db
    .select()
    .from(activities)
    .where(
      and(eq(activities.id, activityId), eq(activities.instructorId, instructorId)),
    )
    .limit(1);

  return row ?? null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const existing = await getOwnedActivity(user.id, id);

  if (!existing) {
    return jsonError("Activity not found.", 404);
  }

  const body = (await readJson(request)) as ActivityPayloadBody | null;
  const parsed = parseActivityPayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error);
  }

  const { title, templateType, librasVideoUrl, jsonOptions, requestedClassIds } =
    parsed.data;

  const ownedClassIds = requestedClassIds.length
    ? await db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.instructorId, user.id),
            inArray(classes.id, requestedClassIds),
          ),
        )
    : [];

  const validClassIds = new Set(ownedClassIds.map((row) => row.id));
  const invalidClassId = requestedClassIds.find(
    (classId) => !validClassIds.has(classId),
  );

  if (invalidClassId) {
    return jsonError("One of the selected classes was not found.", 404);
  }

  const [updated] = await db
    .update(activities)
    .set({
      title,
      templateType,
      librasVideoUrl,
      jsonOptions,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, id))
    .returning();

  if (!updated) {
    return jsonError("Activity could not be updated.", 500);
  }

  await db
    .delete(classActivities)
    .where(eq(classActivities.activityId, id));

  if (requestedClassIds.length > 0) {
    await db.insert(classActivities).values(
      requestedClassIds.map((classId) => ({
        classId,
        activityId: id,
      })),
    );
  }

  return NextResponse.json({
    activity: toDashboardActivity(updated, requestedClassIds),
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const existing = await getOwnedActivity(user.id, id);

  if (!existing) {
    return jsonError("Activity not found.", 404);
  }

  await db.delete(activities).where(eq(activities.id, id));

  return NextResponse.json({ ok: true });
}
