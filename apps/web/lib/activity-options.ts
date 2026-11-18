import type { Json } from "@asebili/database";
import {
  DEFAULT_LANGUAGE,
  formatMessage,
  translate,
  type Language,
} from "@asebili/i18n";

export type MemoryPair = {
  id: string;
  term: string;
  sign: string;
};

export type MatchingPair = {
  id: string;
  left: string;
  right: string;
};

export function createMemoryPair(id?: string): MemoryPair {
  return {
    id: id ?? `mem-${Date.now()}`,
    term: "",
    sign: "",
  };
}

export function createDefaultMemoryPairs(): MemoryPair[] {
  return [
    createMemoryPair("mem-1"),
    createMemoryPair("mem-2"),
    createMemoryPair("mem-3"),
  ];
}

export function createMatchingPair(id?: string): MatchingPair {
  return {
    id: id ?? `match-${Date.now()}`,
    left: "",
    right: "",
  };
}

export function createDefaultMatchingPairs(): MatchingPair[] {
  return [
    createMatchingPair("match-1"),
    createMatchingPair("match-2"),
    createMatchingPair("match-3"),
  ];
}

export function memoryToJson(pairs: MemoryPair[]): Json {
  return {
    pairs: pairs.map(({ term, sign }) => ({ term: term.trim(), sign: sign.trim() })),
  };
}

export function matchingToJson(pairs: MatchingPair[]): Json {
  return {
    pairs: pairs.map(({ left, right }) => ({
      left: left.trim(),
      right: right.trim(),
    })),
  };
}

export function validateMemoryPairs(
  pairs: MemoryPair[],
  language: Language = DEFAULT_LANGUAGE,
): string | null {
  if (pairs.length === 0) {
    return translate(language, "dashboard.validation.memoryEmpty");
  }

  for (const [index, pair] of pairs.entries()) {
    if (!pair.term.trim() || !pair.sign.trim()) {
      return formatMessage(
        translate(language, "dashboard.validation.memoryPairIncomplete"),
        { index: index + 1 },
      );
    }
  }

  return null;
}

export function validateMatchingPairs(
  pairs: MatchingPair[],
  language: Language = DEFAULT_LANGUAGE,
): string | null {
  if (pairs.length === 0) {
    return translate(language, "dashboard.validation.matchingEmpty");
  }

  for (const [index, pair] of pairs.entries()) {
    if (!pair.left.trim() || !pair.right.trim()) {
      return formatMessage(
        translate(language, "dashboard.validation.matchingPairIncomplete"),
        { index: index + 1 },
      );
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function memoryPairsFromJson(json: Json): MemoryPair[] | null {
  if (!isRecord(json) || !Array.isArray(json.pairs)) return null;
  const pairs = json.pairs
    .map((row, index) => {
      if (!isRecord(row)) return null;
      const term = typeof row.term === "string" ? row.term : "";
      const sign = typeof row.sign === "string" ? row.sign : "";
      return { id: `mem-${index}`, term, sign };
    })
    .filter((row): row is MemoryPair => row !== null);
  return pairs.length > 0 ? pairs : null;
}

export function matchingPairsFromJson(json: Json): MatchingPair[] | null {
  if (!isRecord(json) || !Array.isArray(json.pairs)) return null;
  const pairs = json.pairs
    .map((row, index) => {
      if (!isRecord(row)) return null;
      const left = typeof row.left === "string" ? row.left : "";
      const right = typeof row.right === "string" ? row.right : "";
      return { id: `match-${index}`, left, right };
    })
    .filter((row): row is MatchingPair => row !== null);
  return pairs.length > 0 ? pairs : null;
}
