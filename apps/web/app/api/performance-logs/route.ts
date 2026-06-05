import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { activities, classes, performanceLogs } from "@asebili/database/schema";
import { getCurrentUser } from "../../../lib/api-auth";
import { db } from "../../../lib/db";
import { jsonError } from "../../../lib/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return jsonError("Unauthorized", 401);

  const rows = await db
    .select({
      log: performanceLogs,
      activityTitle: activities.title,
      className: classes.name,
      classAccessCode: classes.accessCode,
    })
    .from(performanceLogs)
    .innerJoin(activities, eq(activities.id, performanceLogs.activityId))
    .leftJoin(classes, eq(classes.id, performanceLogs.classId))
    .where(eq(activities.instructorId, user.id))
    .orderBy(desc(performanceLogs.createdAt))
    .limit(100);

  return NextResponse.json({
    logs: rows.map(({ log, activityTitle, className, classAccessCode }) => ({
      id: log.id,
      activityId: log.activityId,
      activityTitle,
      classId: log.classId,
      className,
      classAccessCode,
      responseTimeSeconds: log.responseTimeSeconds,
      correctAnswers: log.correctAnswers,
      wrongAnswers: log.wrongAnswers,
      answerDetails: log.answerDetails ?? null,
      createdAt: log.createdAt.toISOString(),
    })),
  });
}
