export type VisualConcept = {
  id: string;
  label: string;
  symbol: string;
  color?: string;
  imageUrl: string;
  signVideoUrl?: string;
};

const WIKI = "https://upload.wikimedia.org/wikipedia/commons";
const LIBRAS_CACHORRO_WEBM = `${WIKI}/transcoded/d/d3/Libras-cachorro.ogv/Libras-cachorro.ogv.360p.webm`;

export const COLOR_CONCEPTS: Record<string, VisualConcept> = {
  vermelho: {
    id: "vermelho",
    label: "vermelho",
    symbol: "🔴",
    color: "#E53935",
    imageUrl: `${WIKI}/thumb/3/3a/Tomate.JPG/480px-Tomate.JPG`,
    signVideoUrl: "https://assets.mixkit.co/videos/40213/40213-360.mp4",
  },
  azul: {
    id: "azul",
    label: "azul",
    symbol: "🔵",
    color: "#1E88E5",
    imageUrl: `${WIKI}/thumb/5/5c/Blue_sky_with_clouds%2C_Cumulus.jpg/480px-Blue_sky_with_clouds%2C_Cumulus.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/45602/45602-360.mp4",
  },
  amarelo: {
    id: "amarelo",
    label: "amarelo",
    symbol: "🟡",
    color: "#FDD835",
    imageUrl: `${WIKI}/thumb/8/8a/Bananas_white_background.jpg/480px-Bananas_white_background.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/35333/35333-360.mp4",
  },
  verde: {
    id: "verde",
    label: "verde",
    symbol: "🟢",
    color: "#43A047",
    imageUrl: `${WIKI}/thumb/0/07/Leaf_1_web.jpg/480px-Leaf_1_web.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/2277/2277-360.mp4",
  },
  roxo: {
    id: "roxo",
    label: "roxo",
    symbol: "🟣",
    color: "#8E24AA",
    imageUrl: `${WIKI}/thumb/3/3d/Lavender_flowers_2.jpg/480px-Lavender_flowers_2.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/2278/2278-360.mp4",
  },
  laranja: {
    id: "laranja",
    label: "laranja",
    symbol: "🟠",
    color: "#FB8C00",
    imageUrl: `${WIKI}/thumb/c/c4/Orange-Fruit-Pieces.jpg/480px-Orange-Fruit-Pieces.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/2279/2279-360.mp4",
  },
};

export const FAMILY_CONCEPTS: Record<string, VisualConcept> = {
  mae: {
    id: "mae",
    label: "mãe",
    symbol: "👩",
    imageUrl: `${WIKI}/thumb/5/53/Mother Daughter Portrait.jpg/480px-Mother_Daughter_Portrait.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/4550/4550-360.mp4",
  },
  pai: {
    id: "pai",
    label: "pai",
    symbol: "👨",
    imageUrl: `${WIKI}/thumb/4/41/Father_and_son.jpg/480px-Father_and_son.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/4571/4571-360.mp4",
  },
  irmao: {
    id: "irmao",
    label: "irmão",
    symbol: "👦",
    imageUrl: `${WIKI}/thumb/2/2c/Brothers_playing.jpg/480px-Brothers_playing.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/23873/23873-360.mp4",
  },
  irma: {
    id: "irma",
    label: "irmã",
    symbol: "👧",
    imageUrl: `${WIKI}/thumb/1/1b/Sisters.jpg/480px-Sisters.jpg`,
    signVideoUrl: "https://assets.mixkit.co/videos/23873/23873-360.mp4",
  },
};

export const INTRO_LIBRAS_VIDEOS = {
  colors: LIBRAS_CACHORRO_WEBM,
  family: LIBRAS_CACHORRO_WEBM,
  librasSample: LIBRAS_CACHORRO_WEBM,
} as const;

function getColorConcept(id: string): VisualConcept {
  const concept = COLOR_CONCEPTS[id];
  if (!concept) throw new Error(`Unknown color concept: ${id}`);
  return concept;
}

function getFamilyConcept(id: string): VisualConcept {
  const concept = FAMILY_CONCEPTS[id];
  if (!concept) throw new Error(`Unknown family concept: ${id}`);
  return concept;
}

function conceptOption(
  concept: VisualConcept,
  optionId: string,
): {
  id: string;
  label: string;
  color?: string;
  symbol: string;
  imageUrl: string;
  videoUrl?: string;
} {
  return {
    id: optionId,
    label: concept.label,
    color: concept.color,
    symbol: concept.symbol,
    imageUrl: concept.imageUrl,
    videoUrl: concept.signVideoUrl,
  };
}

function wordOption(concept: VisualConcept, optionId: string) {
  return {
    id: optionId,
    label: concept.label,
  };
}

export function buildColorsSignToColorQuiz() {
  const rounds: Array<{
    id: string;
    correctId: keyof typeof COLOR_CONCEPTS;
    optionIds: (keyof typeof COLOR_CONCEPTS)[];
    correctOptionId: string;
  }> = [
    {
      id: "cores-q1",
      correctId: "vermelho",
      optionIds: ["vermelho", "azul", "amarelo", "verde"],
      correctOptionId: "a",
    },
    {
      id: "cores-q2",
      correctId: "azul",
      optionIds: ["amarelo", "azul", "vermelho", "roxo"],
      correctOptionId: "b",
    },
    {
      id: "cores-q3",
      correctId: "verde",
      optionIds: ["verde", "azul", "amarelo", "roxo"],
      correctOptionId: "a",
    },
  ];

  return {
    questions: rounds.map((round) => {
      const correct = getColorConcept(round.correctId);
      const letters = ["a", "b", "c", "d"] as const;
      const options = round.optionIds.map((conceptId, index) =>
        wordOption(getColorConcept(conceptId), letters[index] ?? "a"),
      );

      return {
        id: round.id,
        promptMode: "sign-pick" as const,
        promptColor: correct.color,
        promptVideoUrl: correct.signVideoUrl,
        promptImageUrl: correct.imageUrl,
        promptLabel: correct.label,
        options,
        correctOptionId: round.correctOptionId,
      };
    }),
  };
}

export function buildColorsColorToWordQuiz() {
  const items = [
    {
      prompt: "azul",
      correct: "azul",
      distractors: ["vermelho", "amarelo", "verde"],
    },
    {
      prompt: "vermelho",
      correct: "vermelho",
      distractors: ["azul", "roxo", "laranja"],
    },
  ] as const;

  return {
    questions: items.map((item, index) => {
      const promptConcept = getColorConcept(item.prompt);
      const correct = getColorConcept(item.correct);
      const distractorIds = item.distractors;
      const optionIds = ["a", "b", "c", "d"] as const;
      const all = [correct, ...distractorIds.map((id) => getColorConcept(id))];
      const correctIndex = 0;
      const options = all.map((concept, optionIndex) =>
        wordOption(concept, optionIds[optionIndex] ?? "a"),
      );

      return {
        id: `cores-word-q${index + 1}`,
        promptMode: "color-pick" as const,
        promptColor: promptConcept.color,
        promptImageUrl: promptConcept.imageUrl,
        promptLabel: promptConcept.label,
        options,
        correctOptionId: optionIds[correctIndex],
      };
    }),
  };
}

export function buildFamilySignToWordQuiz() {
  const rounds = [
    {
      id: "familia-q1",
      correctId: "mae" as const,
      optionIds: ["mae", "pai", "irma", "irmao"] as const,
      correctOptionId: "a",
    },
    {
      id: "familia-q2",
      correctId: "pai" as const,
      optionIds: ["irmao", "pai", "mae", "irma"] as const,
      correctOptionId: "b",
    },
    {
      id: "familia-q3",
      correctId: "irmao" as const,
      optionIds: ["irma", "mae", "irmao", "pai"] as const,
      correctOptionId: "c",
    },
  ];

  return {
    questions: rounds.map((round) => {
      const correct = getFamilyConcept(round.correctId);
      const letters = ["a", "b", "c", "d"] as const;
      const options = round.optionIds.map((conceptId, index) =>
        conceptOption(getFamilyConcept(conceptId), letters[index] ?? "a"),
      );

      return {
        id: round.id,
        promptMode: "sign-pick" as const,
        promptSymbol: correct.symbol,
        promptVideoUrl: correct.signVideoUrl,
        promptImageUrl: correct.imageUrl,
        options,
        correctOptionId: round.correctOptionId,
      };
    }),
  };
}
