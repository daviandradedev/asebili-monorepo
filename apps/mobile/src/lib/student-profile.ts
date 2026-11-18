import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@asebili/student-profile/v1";

export function normalizeStudentName(name: string) {
  return name.trim().slice(0, 80);
}

export async function saveStudentName(name: string) {
  const normalized = normalizeStudentName(name);
  if (!normalized) return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ name: normalized }));
}

export async function getStudentName() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { name?: string };
    return normalizeStudentName(parsed.name ?? "");
  } catch {
    return "";
  }
}
