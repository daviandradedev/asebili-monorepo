import { and, eq } from "drizzle-orm";
import {
  gradeQuizSubmission,
  parseQuizOptions,
  type QuizSubmissionDetails,
} from "@asebili/database";
import {
  activities,
  classActivities,
  performanceLogs,
} from "@asebili/database/schema";
import { db } from "../../../../../../lib/db";
import { readJson } from "../../../../../../lib/http";
import {
  publicJson,
  publicJsonError,
  publicOptions,
} from "../../../../../../lib/public-api-http";
import { newId } from "../../../../../../lib/server-utils";

export const runtime = "nodejs";

export function OPTIONS() {
  return publicOptions();
}

type CreateLogBody = {
  classId?: unknown;
  studentName?: unknown;
  responseTimeSeconds?: unknown;
  correctAnswers?: unknown;
  wrongAnswers?: unknown;
  answerDetails?: unknown;
};

function parseStudentName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 80);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSelections(body: CreateLogBody | null) {
  if (!body?.answerDetails || !isRecord(body.answerDetails)) return null;
  if (!Array.isArray(body.answerDetails.answers)) return null;

  const selections: Record<string, string> = {};
  for (const entry of body.answerDetails.answers) {
    if (!isRecord(entry)) continue;
    const questionId =
      typeof entry.questionId === "string" ? entry.questionId.trim() : "";
    const selectedOptionId =
      typeof entry.selectedOptionId === "string"
        ? entry.selectedOptionId.trim()
        : "";
    if (questionId && selectedOptionId) {
      selections[questionId] = selectedOptionId;
    }
  }

  return selections;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await readJson(request)) as CreateLogBody | null;
  const responseTimeSeconds =
    typeof body?.responseTimeSeconds === "number"
      ? body.responseTimeSeconds
      : Number.NaN;
  const classId =
    typeof body?.classId === "string" && body.classId.trim()
      ? body.classId.trim()
      : null;
  const studentName = parseStudentName(body?.studentName);
  const selections = parseSelections(body);

  if (!Number.isFinite(responseTimeSeconds) || responseTimeSeconds < 0) {
    return publicJsonError("A valid response time is required.");
  }

  if (studentName.length < 2) {
    return publicJsonError("Student name is required.");
  }

  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);

  if (!activity) {
    return publicJsonError("Activity not found.", 404);
  }

  if (classId) {
    const [link] = await db
      .select({ classId: classActivities.classId })
      .from(classActivities)
      .where(
        and(
          eq(classActivities.classId, classId),
          eq(classActivities.activityId, activity.id),
        ),
      )
      .limit(1);

    if (!link) {
      return publicJsonError("Activity is not available for this class.", 403);
    }
  }

  const quiz = parseQuizOptions(activity.jsonOptions);

  if (quiz) {
    if (!selections) {
      return publicJsonError("Quiz answers are required.");
    }

    for (const question of quiz.questions) {
      if (!selections[question.id]) {
        return publicJsonError("All questions must be answered before submitting.");
      }
    }

    const graded: QuizSubmissionDetails = gradeQuizSubmission(quiz, selections);
    const correctAnswers = graded.answers.filter(
      (answer) => answer.correct,
    ).length;
    const wrongAnswers = graded.answers.length - correctAnswers;

    const [created] = await db
      .insert(performanceLogs)
      .values({
        id: newId(),
        activityId: activity.id,
        classId,
        studentName,
        responseTimeSeconds,
        correctAnswers,
        wrongAnswers,
        answerDetails: graded,
      })
      .returning({
        id: performanceLogs.id,
        createdAt: performanceLogs.createdAt,
      });

    if (!created) {
      return publicJsonError("Performance log could not be created.", 500);
    }

    return publicJson(
      {
        log: {
          id: created.id,
          createdAt: created.createdAt.toISOString(),
          studentName,
          correctAnswers,
          wrongAnswers,
          scorePercent: graded.scorePercent,
          answerDetails: graded,
        },
      },
      { status: 201 },
    );
  }

  const correctAnswers =
    typeof body?.correctAnswers === "number" ? body.correctAnswers : Number.NaN;
  const wrongAnswers =
    typeof body?.wrongAnswers === "number" ? body.wrongAnswers : Number.NaN;

  if (
    !Number.isFinite(correctAnswers) ||
    !Number.isFinite(wrongAnswers) ||
    correctAnswers < 0 ||
    wrongAnswers < 0
  ) {
    return publicJsonError("Correct and wrong answer counts are required.");
  }

  const [created] = await db
    .insert(performanceLogs)
    .values({
      id: newId(),
      activityId: activity.id,
      classId,
      studentName,
      responseTimeSeconds,
      correctAnswers,
      wrongAnswers,
      answerDetails: null,
    })
    .returning({
      id: performanceLogs.id,
      createdAt: performanceLogs.createdAt,
    });

  if (!created) {
    return publicJsonError("Performance log could not be created.", 500);
  }

  return publicJson(
    {
      log: {
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        studentName,
        correctAnswers,
        wrongAnswers,
      },
    },
    { status: 201 },
  );
}
