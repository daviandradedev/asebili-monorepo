import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@asebili/class-session/v1";

export type ClassSession = {
  code: string;
  className?: string;
  classId?: string;
  studentName?: string;
};

export async function saveClassSession(session: ClassSession) {
  const code = session.code.trim().toUpperCase();
  if (!code) return;

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      code,
      className: session.className?.trim() || undefined,
      classId: session.classId?.trim() || undefined,
      studentName: session.studentName?.trim() || undefined,
    }),
  );
}

export async function getClassSession(): Promise<ClassSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClassSession;
    if (!parsed.code?.trim()) return null;
    return {
      code: parsed.code.trim().toUpperCase(),
      className: parsed.className,
      classId: parsed.classId,
      studentName: parsed.studentName,
    };
  } catch {
    return null;
  }
}
