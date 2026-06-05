import type { Language } from "./index";

type LocalizedLabel = { en: string; pt: string };

const DEMO_CLASSES = {
  morning: {
    en: "Grade 3A — Morning",
    pt: "3º ano A — manhã",
  },
  afternoon: {
    en: "Grade 3B — Afternoon",
    pt: "3º ano B — tarde",
  },
} satisfies Record<string, LocalizedLabel>;

const DEMO_ACTIVITIES = {
  colors: {
    en: "Colors in Portuguese",
    pt: "Cores em português",
  },
  animals: {
    en: "Animals: Portuguese words",
    pt: "Animais: palavras em português",
  },
  numbers: {
    en: "Numbers 1 to 5",
    pt: "Números 1 a 5",
  },
  family: {
    en: "My family",
    pt: "Minha família",
  },
} satisfies Record<string, LocalizedLabel>;

function resolveClassKey(name: string): keyof typeof DEMO_CLASSES | null {
  const normalized = name.toLowerCase();

  if (/morning|manh[aã]|grade\s*3a|3[oº]?\s*ano\s*a/.test(normalized)) {
    return "morning";
  }

  if (/afternoon|tarde|grade\s*3b|3[oº]?\s*ano\s*b/.test(normalized)) {
    return "afternoon";
  }

  return null;
}

function resolveActivityKey(title: string): keyof typeof DEMO_ACTIVITIES | null {
  const normalized = title.toLowerCase();

  if (/colors|cores/.test(normalized)) {
    return "colors";
  }

  if (/animals|animais/.test(normalized)) {
    return "animals";
  }

  if (/numbers|n[uú]meros/.test(normalized)) {
    return "numbers";
  }

  if (/family|fam[ií]lia/.test(normalized)) {
    return "family";
  }

  return null;
}

export function localizeClassName(name: string, language: Language): string {
  const key = resolveClassKey(name);
  if (key) return DEMO_CLASSES[key][language];
  return name;
}

export function localizeActivityTitle(title: string, language: Language): string {
  const key = resolveActivityKey(title);
  if (key) return DEMO_ACTIVITIES[key][language];
  return title;
}

export function demoColorsActivityTitle(language: Language): string {
  return DEMO_ACTIVITIES.colors[language];
}
