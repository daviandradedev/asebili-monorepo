import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@asebili/mission-progress/v1";

export type MissionCompletion = {
  activityId: string;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
};

type MissionProgressStore = Record<string, Record<string, MissionCompletion>>;

function classScopeKey(classCode?: string, classId?: string) {
  const code = classCode?.trim().toUpperCase();
  if (code) return `code:${code}`;
  if (classId?.trim()) return `id:${classId.trim()}`;
  return "global";
}

async function readStore(): Promise<MissionProgressStore> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MissionProgressStore;
  } catch {
    return {};
  }
}

async function writeStore(store: MissionProgressStore) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export async function getClassMissionProgress(
  classCode?: string,
  classId?: string,
) {
  const store = await readStore();
  return store[classScopeKey(classCode, classId)] ?? {};
}

export async function markMissionCompleted(input: {
  activityId: string;
  classCode?: string;
  classId?: string;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
}) {
  const scope = classScopeKey(input.classCode, input.classId);
  const store = await readStore();
  const scoped = store[scope] ?? {};

  scoped[input.activityId] = {
    activityId: input.activityId,
    scorePercent: input.scorePercent,
    correctAnswers: input.correctAnswers,
    totalQuestions: input.totalQuestions,
    completedAt: new Date().toISOString(),
  };

  store[scope] = scoped;
  await writeStore(store);
}
