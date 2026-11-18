import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { activities, classActivities, classes } from "@asebili/database/schema";
import {
  parseActivityPayload,
  type ActivityPayloadBody,
} from "../../../lib/activity-payload";
import { getCurrentUser } from "../../../lib/api-auth";
import { db } from "../../../lib/db";
import { jsonError, readJson } from "../../../lib/http";
import { newId, toDashboardActivity } from "../../../lib/server-utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.instructorId, user.id))
    .orderBy(desc(activities.createdAt));

  const links = rows.length
    ? await db
        .select({
          activityId: classActivities.activityId,
          classId: classActivities.classId,
        })
        .from(classActivities)
        .where(
          inArray(
            classActivities.activityId,
            rows.map((row) => row.id),
          ),
        )
    : [];

  const classIdsByActivity = new Map<string, string[]>();
  for (const link of links) {
    classIdsByActivity.set(link.activityId, [
      ...(classIdsByActivity.get(link.activityId) ?? []),
      link.classId,
    ]);
  }

  return NextResponse.json({
    activities: rows.map((row) =>
      toDashboardActivity(row, classIdsByActivity.get(row.id) ?? []),
    ),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

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

  const [created] = await db
    .insert(activities)
    .values({
      id: newId(),
      instructorId: user.id,
      title,
      templateType,
      librasVideoUrl,
      jsonOptions,
    })
    .returning();

  if (!created) {
    return jsonError("Activity could not be created.", 500);
  }

  if (requestedClassIds.length > 0) {
    await db.insert(classActivities).values(
      requestedClassIds.map((classId) => ({
        classId,
        activityId: created.id,
      })),
    );
  }

  return NextResponse.json(
    { activity: toDashboardActivity(created, requestedClassIds) },
    { status: 201 },
  );
}
