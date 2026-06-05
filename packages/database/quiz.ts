import type { Json } from "./types";

export const QUIZ_OPTION_COUNT = 4;

export type QuizPromptMode = "sign-pick" | "color-pick" | "word-pick";

export type QuizOption = {
  id: string;
  text?: string;
  label?: string;
  color?: string;
  symbol?: string;
  videoUrl?: string;
  imageUrl?: string;
};

export type QuizQuestion = {
  id: string;
  prompt?: string;
  promptMode?: QuizPromptMode;
  promptLabel?: string;
  promptVideoUrl?: string;
  promptImageUrl?: string;
  promptColor?: string;
  promptSymbol?: string;
  options: QuizOption[];
  correctOptionId: string;
};

export type QuizActivityOptions = {
  questions: QuizQuestion[];
};

export type PublicQuizQuestion = {
  id: string;
  prompt?: string;
  promptMode?: QuizPromptMode;
  promptLabel?: string;
  promptVideoUrl?: string;
  promptImageUrl?: string;
  promptColor?: string;
  promptSymbol?: string;
  options: QuizOption[];
};

export type QuizAnswerDetail = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  correct: boolean;
};

export type QuizSubmissionDetails = {
  answers: QuizAnswerDetail[];
  scorePercent: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trimString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasOptionContent(option: QuizOption) {
  return Boolean(
    option.label?.trim() ||
    option.text?.trim() ||
    option.color?.trim() ||
    option.symbol?.trim() ||
    option.videoUrl?.trim() ||
    option.imageUrl?.trim(),
  );
}

function hasPromptContent(question: QuizQuestion) {
  return Boolean(
    question.prompt?.trim() ||
    question.promptLabel?.trim() ||
    question.promptVideoUrl?.trim() ||
    question.promptImageUrl?.trim() ||
    question.promptColor?.trim() ||
    question.promptSymbol?.trim(),
  );
}

export function optionDisplayLabel(option: QuizOption) {
  return (
    option.label?.trim() || option.text?.trim() || option.symbol?.trim() || "—"
  );
}

function parseOption(value: unknown, index: number): QuizOption | null {
  if (!isRecord(value)) return null;
  const id = trimString(value.id) || `opt-${index}`;
  const option: QuizOption = {
    id,
    text: trimString(value.text) || undefined,
    label: trimString(value.label) || undefined,
    color: trimString(value.color) || undefined,
    symbol: trimString(value.symbol) || undefined,
    videoUrl: trimString(value.videoUrl) || undefined,
    imageUrl: trimString(value.imageUrl) || undefined,
  };

  return hasOptionContent(option) ? option : null;
}

function parseQuestion(value: unknown, index: number): QuizQuestion | null {
  if (!isRecord(value)) return null;
  const id = trimString(value.id) || `q-${index + 1}`;

  if (!Array.isArray(value.options)) return null;
  const options = value.options
    .map((option, optionIndex) => parseOption(option, optionIndex))
    .filter((option): option is QuizOption => option !== null);

  if (options.length !== QUIZ_OPTION_COUNT) return null;

  const correctOptionId = trimString(value.correctOptionId);
  if (!options.some((option) => option.id === correctOptionId)) return null;

  const promptMode = trimString(value.promptMode) as QuizPromptMode;
  const question: QuizQuestion = {
    id,
    prompt: trimString(value.prompt) || undefined,
    promptMode:
      promptMode === "sign-pick" ||
      promptMode === "color-pick" ||
      promptMode === "word-pick"
        ? promptMode
        : undefined,
    promptLabel: trimString(value.promptLabel) || undefined,
    promptVideoUrl: trimString(value.promptVideoUrl) || undefined,
    promptImageUrl: trimString(value.promptImageUrl) || undefined,
    promptColor: trimString(value.promptColor) || undefined,
    promptSymbol: trimString(value.promptSymbol) || undefined,
    options,
    correctOptionId,
  };

  return hasPromptContent(question) ? question : null;
}

const LEGACY_DISTRACTORS = ["Outro", "Diferente", "Não sei"] as const;

function parseLegacyItems(json: Json): QuizActivityOptions | null {
  if (!isRecord(json) || !Array.isArray(json.items)) return null;

  const questions: QuizQuestion[] = [];

  for (const [index, value] of json.items.entries()) {
    if (!isRecord(value)) continue;
    const prompt = trimString(value.prompt);
    const answer = trimString(value.answer);
    if (!prompt || !answer) continue;

    const options: QuizOption[] = [
      { id: "a", label: answer, text: answer },
      ...LEGACY_DISTRACTORS.map((text, optionIndex) => ({
        id: String.fromCharCode(98 + optionIndex),
        label: text,
        text,
      })),
    ];

    questions.push({
      id: `legacy-q-${index + 1}`,
      prompt,
      promptMode: "sign-pick",
      promptSymbol: "🤟",
      options,
      correctOptionId: "a",
    });
  }

  return questions.length > 0 ? { questions } : null;
}

export function parseQuizOptions(json: Json): QuizActivityOptions | null {
  if (!isRecord(json)) return null;

  if (Array.isArray(json.questions)) {
    const questions = json.questions
      .map((question, index) => parseQuestion(question, index))
      .filter((question): question is QuizQuestion => question !== null);

    if (questions.length > 0) return { questions };
  }

  return parseLegacyItems(json);
}

export function validateQuizForPublish(
  quiz: QuizActivityOptions,
): string | null {
  for (const [index, question] of quiz.questions.entries()) {
    if (!hasPromptContent(question)) {
      return `Pergunta ${index + 1}: adicione vídeo, cor, símbolo ou rótulo curto.`;
    }
    if (question.options.length !== QUIZ_OPTION_COUNT) {
      return `Pergunta ${index + 1} precisa de ${QUIZ_OPTION_COUNT} alternativas.`;
    }
    for (const [optionIndex, option] of question.options.entries()) {
      if (!hasOptionContent(option)) {
        return `Pergunta ${index + 1}, alternativa ${optionIndex + 1}: use cor, símbolo, imagem, vídeo ou uma palavra.`;
      }
    }
    if (
      !question.options.some((option) => option.id === question.correctOptionId)
    ) {
      return `Pergunta ${index + 1}: marque a alternativa correta.`;
    }
  }
  return null;
}

export function stripQuizForStudent(
  quiz: QuizActivityOptions,
): PublicQuizQuestion[] {
  return quiz.questions.map(
    ({
      id,
      prompt,
      promptMode,
      promptLabel,
      promptVideoUrl,
      promptImageUrl,
      promptColor,
      promptSymbol,
      options,
    }) => ({
      id,
      prompt,
      promptMode,
      promptLabel,
      promptVideoUrl,
      promptImageUrl,
      promptColor,
      promptSymbol,
      options: options.map(
        ({ id: optionId, text, label, color, symbol, videoUrl, imageUrl }) => ({
          id: optionId,
          text,
          label,
          color,
          symbol,
          videoUrl,
          imageUrl,
        }),
      ),
    }),
  );
}

export function gradeQuizSubmission(
  quiz: QuizActivityOptions,
  selections: Record<string, string>,
): QuizSubmissionDetails {
  const answers: QuizAnswerDetail[] = quiz.questions.map((question) => {
    const selectedOptionId = selections[question.id] ?? "";
    const correct = selectedOptionId === question.correctOptionId;
    return {
      questionId: question.id,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      correct,
    };
  });

  const correctCount = answers.filter((answer) => answer.correct).length;
  const total = answers.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return { answers, scorePercent };
}

export const DEFAULT_QUIZ_QUESTION_ID = "q-new-1";

export function syncPromptFromCorrectOption(
  question: QuizQuestion,
): QuizQuestion {
  const correct = question.options.find(
    (option) => option.id === question.correctOptionId,
  );
  if (!correct) return question;

  const next: QuizQuestion = {
    ...question,
    promptColor: correct.color?.trim() || question.promptColor,
    promptVideoUrl: correct.videoUrl?.trim() || question.promptVideoUrl,
    promptImageUrl: correct.imageUrl?.trim() || question.promptImageUrl,
    promptLabel:
      correct.label?.trim() || correct.text?.trim() || question.promptLabel,
  };

  if (correct.color?.trim()) {
    delete next.promptSymbol;
  }

  return next;
}

export function createEmptyQuizQuestion(id?: string): QuizQuestion {
  const options: QuizOption[] = [
    { id: "a", label: "" },
    { id: "b", label: "" },
    { id: "c", label: "" },
    { id: "d", label: "" },
  ];

  return {
    id: id ?? DEFAULT_QUIZ_QUESTION_ID,
    promptMode: "sign-pick",
    options,
    correctOptionId: "a",
  };
}

export function createDefaultQuizOptions(): QuizActivityOptions {
  return { questions: [createEmptyQuizQuestion(DEFAULT_QUIZ_QUESTION_ID)] };
}

export function createNewQuizQuestionId(existingIds: string[]) {
  let index = existingIds.length + 1;
  let candidate = `q-new-${index}`;

  while (existingIds.includes(candidate)) {
    index += 1;
    candidate = `q-new-${index}`;
  }

  return candidate;
}

export function quizToJson(quiz: QuizActivityOptions): Json {
  return quiz as unknown as Json;
}
