import { and, desc, eq, inArray } from "drizzle-orm";
import type { DashboardPerformanceLog } from "@asebili/database";
import {
  activities,
  classActivities,
  classes,
  performanceLogs,
} from "@asebili/database/schema";
import { db } from "./db";
import { toDashboardActivity, toDashboardClass } from "./server-utils";

export async function getInstructorClasses(instructorId: string) {
  const classRows = await db
    .select()
    .from(classes)
    .where(eq(classes.instructorId, instructorId))
    .orderBy(desc(classes.createdAt));

  return classRows.map(toDashboardClass);
}

export async function getInstructorActivity(
  instructorId: string,
  activityId: string,
) {
  const [row] = await db
    .select()
    .from(activities)
    .where(
      and(eq(activities.id, activityId), eq(activities.instructorId, instructorId)),
    )
    .limit(1);

  if (!row) return null;

  const links = await db
    .select({ classId: classActivities.classId })
    .from(classActivities)
    .where(eq(classActivities.activityId, activityId));

  return toDashboardActivity(
    row,
    links.map((link) => link.classId),
  );
}

export async function getDashboardData(instructorId: string) {
  const [classRows, activityRows, logRows] = await Promise.all([
    db
      .select()
      .from(classes)
      .where(eq(classes.instructorId, instructorId))
      .orderBy(desc(classes.createdAt)),
    db
      .select()
      .from(activities)
      .where(eq(activities.instructorId, instructorId))
      .orderBy(desc(activities.createdAt)),
    db
      .select({
        log: performanceLogs,
        activityTitle: activities.title,
        className: classes.name,
        classAccessCode: classes.accessCode,
      })
      .from(performanceLogs)
      .innerJoin(activities, eq(activities.id, performanceLogs.activityId))
      .leftJoin(classes, eq(classes.id, performanceLogs.classId))
      .where(eq(activities.instructorId, instructorId))
      .orderBy(desc(performanceLogs.createdAt))
      .limit(100),
  ]);

  const links = activityRows.length
    ? await db
        .select({
          activityId: classActivities.activityId,
          classId: classActivities.classId,
        })
        .from(classActivities)
        .where(
          inArray(
            classActivities.activityId,
            activityRows.map((row) => row.id),
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

  const logs: DashboardPerformanceLog[] = logRows.map(
    ({ log, activityTitle, className, classAccessCode }) => ({
      id: log.id,
      activityId: log.activityId,
      activityTitle,
      classId: log.classId,
      className,
      classAccessCode,
      studentName: log.studentName,
      responseTimeSeconds: log.responseTimeSeconds,
      correctAnswers: log.correctAnswers,
      wrongAnswers: log.wrongAnswers,
      answerDetails: log.answerDetails ?? null,
      createdAt: log.createdAt.toISOString(),
    }),
  );

  return {
    classes: classRows.map(toDashboardClass),
    activities: activityRows.map((row) =>
      toDashboardActivity(row, classIdsByActivity.get(row.id) ?? []),
    ),
    logs,
  };
}
