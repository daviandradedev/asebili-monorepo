import Constants from "expo-constants";
import { Platform } from "react-native";
import type {
  PublicActivity,
  PublicClassPayload,
  QuizSubmissionDetails,
} from "@asebili/database/types";

type ApiError = {
  error?: string;
};

function readDevHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) return host;
  }

  const debuggerHost = (
    Constants as {
      expoGoConfig?: { debuggerHost?: string };
    }
  ).expoGoConfig?.debuggerHost;

  if (debuggerHost) {
    return debuggerHost.split(":")[0];
  }

  return null;
}

export function resolveApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (__DEV__) {
    const devHost = readDevHost();
    if (devHost && devHost !== "localhost") {
      return `http://${devHost}:3000`;
    }

    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000";
    }

    return "http://127.0.0.1:3000";
  }

  return "";
}

export const apiBaseUrl = resolveApiBaseUrl();

async function apiFetch<T>(path: string, init?: RequestInit) {
  const url = `${apiBaseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    const hint = apiBaseUrl
      ? `Sem conexão com o servidor (${apiBaseUrl}).`
      : "EXPO_PUBLIC_API_URL não está configurada.";
    throw new Error(
      `${hint} Em produção, defina EXPO_PUBLIC_API_URL com a URL do projeto web na Vercel.`,
    );
  }

  let payload = {} as T & ApiError;
  try {
    payload = (await response.json()) as T & ApiError;
  } catch {
    throw new Error("Resposta inválida do servidor.");
  }

  if (!response.ok) {
    throw new Error(payload.error || "Falha ao conversar com o servidor.");
  }

  return payload;
}

export async function joinClass(accessCode: string) {
  return apiFetch<PublicClassPayload>(
    `/api/public/classes/${encodeURIComponent(accessCode)}`,
  );
}

export async function getActivity(activityId: string) {
  return apiFetch<{ activity: PublicActivity }>(
    `/api/public/activities/${encodeURIComponent(activityId)}`,
  );
}

export async function submitPerformanceLog(input: {
  activityId: string;
  classId?: string;
  studentName: string;
  responseTimeSeconds: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  answerDetails?: {
    answers: Array<{ questionId: string; selectedOptionId: string }>;
    scorePercent?: number;
  };
}) {
  return apiFetch<{
    log: {
      id: string;
      createdAt: string;
      correctAnswers?: number;
      wrongAnswers?: number;
      scorePercent?: number;
      answerDetails?: QuizSubmissionDetails;
    };
  }>(`/api/public/activities/${encodeURIComponent(input.activityId)}/logs`, {
    method: "POST",
    body: JSON.stringify({
      classId: input.classId,
      studentName: input.studentName,
      responseTimeSeconds: input.responseTimeSeconds,
      correctAnswers: input.correctAnswers,
      wrongAnswers: input.wrongAnswers,
      answerDetails: input.answerDetails,
    }),
  });
}
