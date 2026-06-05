import { INTRO_LIBRAS_VIDEOS } from "@asebili/database";

export const SAMPLE_LIBRAS_VIDEOS = [
  {
    id: "libras-cachorro",
    label: "Vídeo de instrução (exemplo)",
    description: "Clip de apoio em LIBRAS para o aluno entender a tarefa — não avalia sinais.",
    url: INTRO_LIBRAS_VIDEOS.librasSample,
  },
  {
    id: "cores-vermelho",
    label: "Red visual prompt / cor vermelha",
    description: "Short color-context clip for a visual quiz prompt.",
    url: "https://assets.mixkit.co/videos/40213/40213-360.mp4",
  },
  {
    id: "cores-azul",
    label: "Blue visual prompt / cor azul",
    description: "Short color-context clip for a visual quiz prompt.",
    url: "https://assets.mixkit.co/videos/45602/45602-360.mp4",
  },
  {
    id: "cores-amarelo",
    label: "Yellow visual prompt / cor amarela",
    description: "Bright object/color clip for testing the quiz flow.",
    url: "https://assets.mixkit.co/videos/35333/35333-360.mp4",
  },
  {
    id: "cores-verde",
    label: "Green visual prompt / cor verde",
    description: "Nature-color clip for testing the video picker.",
    url: "https://assets.mixkit.co/videos/2277/2277-360.mp4",
  },
  {
    id: "cores-roxo",
    label: "Purple visual prompt / cor roxa",
    description: "Visual distractor clip for color activities.",
    url: "https://assets.mixkit.co/videos/2278/2278-360.mp4",
  },
  {
    id: "cores-laranja",
    label: "Orange visual prompt / cor laranja",
    description: "Warm-color clip for quiz and matching demos.",
    url: "https://assets.mixkit.co/videos/2279/2279-360.mp4",
  },
  {
    id: "familia-sinal",
    label: "Family context / família",
    description: "Human-context clip for vocabulary around family.",
    url: "https://assets.mixkit.co/videos/4550/4550-360.mp4",
  },
  {
    id: "familia-pai",
    label: "Father context / pai",
    description: "Family-context clip for a second portfolio activity.",
    url: "https://assets.mixkit.co/videos/4571/4571-360.mp4",
  },
  {
    id: "familia-irmaos",
    label: "Siblings context / irmãos",
    description: "Reusable clip for family vocabulary and distractors.",
    url: "https://assets.mixkit.co/videos/23873/23873-360.mp4",
  },
] as const;

export const DEFAULT_SAMPLE_VIDEO_URL = SAMPLE_LIBRAS_VIDEOS[0].url;
