import { randomInt, randomUUID } from "node:crypto";
import {
  parseQuizOptions,
  stripQuizForStudent,
  type DashboardActivity,
  type DashboardClass,
  type PublicActivity,
  type PublicClass,
} from "@asebili/database";
import type { ActivityRow, ClassRow } from "@asebili/database/schema";

const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newId() {
  return randomUUID();
}

export function generateAccessCode(length = 6) {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += ACCESS_CODE_CHARS.charAt(randomInt(ACCESS_CODE_CHARS.length));
  }

  return code;
}

export function normalizeAccessCode(code: string) {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function toPublicClass(row: ClassRow): PublicClass {
  return {
    id: row.id,
    name: row.name,
    accessCode: row.accessCode,
  };
}

export function toDashboardClass(row: ClassRow): DashboardClass {
  return {
    ...toPublicClass(row),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPublicActivity(row: ActivityRow): PublicActivity {
  const base: PublicActivity = {
    id: row.id,
    title: row.title,
    templateType: row.templateType,
    librasVideoUrl: row.librasVideoUrl,
    jsonOptions: row.jsonOptions,
    createdAt: row.createdAt.toISOString(),
  };

  if (row.templateType === "quiz") {
    const quiz = parseQuizOptions(row.jsonOptions);
    if (quiz) {
      return {
        ...base,
        quizQuestions: stripQuizForStudent(quiz),
      };
    }
  }

  return base;
}

export function toDashboardActivity(
  row: ActivityRow,
  classIds: string[],
): DashboardActivity {
  return {
    ...toPublicActivity(row),
    updatedAt: row.updatedAt.toISOString(),
    classIds,
  };
}
