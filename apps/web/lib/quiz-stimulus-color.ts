import { COLOR_CONCEPTS } from "@asebili/database";

const COLOR_PRESETS = Object.values(COLOR_CONCEPTS);

export function findStimulusColorPresetId(promptColor?: string) {
  if (!promptColor) return "";
  const normalized = promptColor.trim().toLowerCase();
  const match = COLOR_PRESETS.find(
    (concept) => concept.color?.trim().toLowerCase() === normalized,
  );
  return match?.id ?? "";
}

export function getStimulusColorPreset(conceptId: string) {
  return COLOR_CONCEPTS[conceptId] ?? null;
}
