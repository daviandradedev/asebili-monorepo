import type { Json } from "@asebili/database";
import {
  buildColorsSignToColorQuiz,
  buildFamilySignToWordQuiz,
  quizToJson,
} from "@asebili/database";
import demoQuizData from "./demo-quiz-data.json";

export const DEMO_QUIZ_JSON_BY_ACTIVITY_ID = demoQuizData as Record<
  string,
  Json
>;

export const VISUAL_QUIZ_JSON = {
  colors: quizToJson(buildColorsSignToColorQuiz()),
  family: quizToJson(buildFamilySignToWordQuiz()),
} as const satisfies Record<string, Json>;
