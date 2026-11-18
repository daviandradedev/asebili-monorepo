import {
  parseQuizOptions,
  validateQuizForPublish,
  type Json,
} from "@asebili/database";
import {
  matchingPairsFromJson,
  memoryPairsFromJson,
  validateMatchingPairs,
  validateMemoryPairs,
} from "./activity-options";

export type ActivityPayloadBody = {
  title?: unknown;
  templateType?: unknown;
  librasVideoUrl?: unknown;
  jsonOptions?: unknown;
  classIds?: unknown;
  classId?: unknown;
};

export type ParsedActivityPayload = {
  title: string;
  templateType: string;
  librasVideoUrl: string;
  jsonOptions: Json;
  requestedClassIds: string[];
};

export function parseClassIds(body: ActivityPayloadBody) {
  if (Array.isArray(body.classIds)) {
    return [
      ...new Set(
        body.classIds.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        ),
      ),
    ];
  }

  if (typeof body.classId === "string" && body.classId.trim().length > 0) {
    return [body.classId.trim()];
  }

  return [];
}

export function parseActivityPayload(
  body: ActivityPayloadBody | null,
): { error: string } | { data: ParsedActivityPayload } {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const templateType =
    typeof body?.templateType === "string" ? body.templateType.trim() : "quiz";
  const librasVideoUrl =
    typeof body?.librasVideoUrl === "string" && body.librasVideoUrl.trim()
      ? body.librasVideoUrl.trim()
      : null;
  const jsonOptions =
    body?.jsonOptions && typeof body.jsonOptions === "object"
      ? (body.jsonOptions as Json)
      : {};
  const requestedClassIds = body ? parseClassIds(body) : [];

  if (title.length < 2) {
    return { error: "Activity title must have at least 2 characters." };
  }

  if (templateType.length < 2) {
    return { error: "Template type is required." };
  }

  if (templateType === "quiz") {
    const quiz = parseQuizOptions(jsonOptions);
    if (!quiz) {
      return {
        error: "Quiz activities need at least one question with 4 options.",
      };
    }
    const validationError = validateQuizForPublish(quiz);
    if (validationError) {
      return { error: validationError };
    }
  }

  if (templateType === "memory") {
    const pairs = memoryPairsFromJson(jsonOptions);
    const validationError = pairs
      ? validateMemoryPairs(pairs)
      : "Invalid memory pairs.";
    if (!pairs || validationError) {
      return { error: validationError ?? "Invalid memory pairs." };
    }
  }

  if (templateType === "matching") {
    const pairs = matchingPairsFromJson(jsonOptions);
    const validationError = pairs
      ? validateMatchingPairs(pairs)
      : "Invalid matching pairs.";
    if (!pairs || validationError) {
      return { error: validationError ?? "Invalid matching pairs." };
    }
  }

  if (!librasVideoUrl) {
    return { error: "An instruction video URL (LIBRAS) is required." };
  }

  return {
    data: {
      title,
      templateType,
      librasVideoUrl,
      jsonOptions,
      requestedClassIds,
    },
  };
}
