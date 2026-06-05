import { count, eq } from "drizzle-orm";
import {
  gradeQuizSubmission,
  INTRO_LIBRAS_VIDEOS,
  parseQuizOptions,
  type Json,
} from "@asebili/database";
import {
  activities,
  classActivities,
  classes,
  performanceLogs,
} from "@asebili/database/schema";
import { VISUAL_QUIZ_JSON } from "./demo-quiz-data";
import { db } from "./db";
import { generateAccessCode, newId } from "./server-utils";
import { SAMPLE_LIBRAS_VIDEOS } from "./sample-videos";

const QUIZ_COLORS = VISUAL_QUIZ_JSON.colors;
const QUIZ_FAMILY = VISUAL_QUIZ_JSON.family;
const provisionedInstructorIds = new Set<string>();
const pendingProvisions = new Map<string, Promise<boolean>>();

export async function instructorNeedsSampleData(instructorId: string) {
  const [classCount] = await db
    .select({ total: count() })
    .from(classes)
    .where(eq(classes.instructorId, instructorId));

  if (Number(classCount?.total ?? 0) > 0) {
    return false;
  }

  const [activityCount] = await db
    .select({ total: count() })
    .from(activities)
    .where(eq(activities.instructorId, instructorId));

  return (
    Number(classCount?.total ?? 0) === 0 &&
    Number(activityCount?.total ?? 0) === 0
  );
}

export async function provisionInstructorSampleData(instructorId: string) {
  if (provisionedInstructorIds.has(instructorId)) {
    return false;
  }

  const pendingProvision = pendingProvisions.get(instructorId);
  if (pendingProvision) {
    return pendingProvision;
  }

  const provisionPromise = provisionInstructorSampleDataOnce(instructorId);
  pendingProvisions.set(instructorId, provisionPromise);

  try {
    const created = await provisionPromise;
    provisionedInstructorIds.add(instructorId);
    return created;
  } finally {
    pendingProvisions.delete(instructorId);
  }
}

async function provisionInstructorSampleDataOnce(instructorId: string) {
  if (!(await instructorNeedsSampleData(instructorId))) {
    return false;
  }

  const now = new Date();
  const morningClassId = newId();
  const afternoonClassId = newId();
  const colorsActivityId = newId();
  const animalsActivityId = newId();
  const numbersActivityId = newId();
  const familyActivityId = newId();

  await db.insert(classes).values([
    {
      id: morningClassId,
      instructorId,
      accessCode: generateAccessCode(),
      name: "Grade 3A — Morning",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: afternoonClassId,
      instructorId,
      accessCode: generateAccessCode(),
      name: "Grade 3B — Afternoon",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const activityRows = [
    {
      id: colorsActivityId,
      instructorId,
      title: "Colors in Portuguese",
      templateType: "quiz",
      librasVideoUrl: INTRO_LIBRAS_VIDEOS.librasSample,
      jsonOptions: QUIZ_COLORS,
      classIds: [morningClassId],
    },
    {
      id: animalsActivityId,
      instructorId,
      title: "Animals: Portuguese words",
      templateType: "memory",
      librasVideoUrl: SAMPLE_LIBRAS_VIDEOS[1].url,
      jsonOptions: {
        pairs: [
          { term: "Gato", sign: "Animal pequeno — palavra em português" },
          { term: "Cachorro", sign: "Animal doméstico — palavra em português" },
          { term: "Pássaro", sign: "Animal que voa — palavra em português" },
        ],
      } satisfies Json,
      classIds: [morningClassId],
    },
    {
      id: numbersActivityId,
      instructorId,
      title: "Numbers 1 to 5",
      templateType: "matching",
      librasVideoUrl: SAMPLE_LIBRAS_VIDEOS[2].url,
      jsonOptions: {
        pairs: [
          { left: "1", right: "Um" },
          { left: "2", right: "Dois" },
          { left: "3", right: "Três" },
          { left: "4", right: "Quatro" },
          { left: "5", right: "Cinco" },
        ],
      } satisfies Json,
      classIds: [afternoonClassId],
    },
    {
      id: familyActivityId,
      instructorId,
      title: "My family",
      templateType: "quiz",
      librasVideoUrl: SAMPLE_LIBRAS_VIDEOS[3].url,
      jsonOptions: QUIZ_FAMILY,
      classIds: [afternoonClassId],
    },
  ];

  await db.insert(activities).values(
    activityRows.map(
      ({
        id,
        instructorId,
        title,
        templateType,
        librasVideoUrl,
        jsonOptions,
      }) => ({
        id,
        instructorId,
        title,
        templateType,
        librasVideoUrl,
        jsonOptions,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );

  await db.insert(classActivities).values(
    activityRows.flatMap((row) =>
      row.classIds.map((classId) => ({
        classId,
        activityId: row.id,
        createdAt: now,
      })),
    ),
  );

  const colorsQuiz = parseQuizOptions(QUIZ_COLORS);
  const familyQuiz = parseQuizOptions(QUIZ_FAMILY);

  const quizSubmissions: Array<{
    activityId: string;
    classId: string;
    responseTimeSeconds: number;
    selections: Record<string, string>;
  }> = [
    {
      activityId: colorsActivityId,
      classId: morningClassId,
      responseTimeSeconds: 95,
      selections: { "cores-q1": "a", "cores-q2": "b", "cores-q3": "c" },
    },
    {
      activityId: colorsActivityId,
      classId: morningClassId,
      responseTimeSeconds: 112,
      selections: { "cores-q1": "a", "cores-q2": "c", "cores-q3": "a" },
    },
    {
      activityId: familyActivityId,
      classId: afternoonClassId,
      responseTimeSeconds: 88,
      selections: { "familia-q1": "a", "familia-q2": "b", "familia-q3": "c" },
    },
    {
      activityId: familyActivityId,
      classId: afternoonClassId,
      responseTimeSeconds: 124,
      selections: { "familia-q1": "b", "familia-q2": "b", "familia-q3": "a" },
    },
  ];

  const memoryLogs = [
    {
      activityId: animalsActivityId,
      classId: morningClassId,
      responseTimeSeconds: 71,
      correctAnswers: 2,
      wrongAnswers: 1,
    },
  ];

  const matchingLogs = [
    {
      activityId: numbersActivityId,
      classId: afternoonClassId,
      responseTimeSeconds: 48,
      correctAnswers: 5,
      wrongAnswers: 0,
    },
    {
      activityId: numbersActivityId,
      classId: afternoonClassId,
      responseTimeSeconds: 62,
      correctAnswers: 4,
      wrongAnswers: 1,
    },
  ];

  const quizLogValues = quizSubmissions.map((entry) => {
    const quiz =
      entry.activityId === colorsActivityId ? colorsQuiz : familyQuiz;
    const graded = quiz && gradeQuizSubmission(quiz, entry.selections);
    const correctAnswers = graded?.answers.filter((a) => a.correct).length ?? 0;
    const wrongAnswers = graded ? graded.answers.length - correctAnswers : 0;

    return {
      id: newId(),
      activityId: entry.activityId,
      classId: entry.classId,
      responseTimeSeconds: entry.responseTimeSeconds,
      correctAnswers,
      wrongAnswers,
      answerDetails: graded ?? null,
      createdAt: now,
    };
  });

  await db.insert(performanceLogs).values([
    ...quizLogValues,
    ...memoryLogs.map((row) => ({
      id: newId(),
      ...row,
      answerDetails: null,
      createdAt: now,
    })),
    ...matchingLogs.map((row) => ({
      id: newId(),
      ...row,
      answerDetails: null,
      createdAt: now,
    })),
  ]);

  return true;
}
