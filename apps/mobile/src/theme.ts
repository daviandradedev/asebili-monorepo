export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  bg: string;
  bgAccent: string;
  surface: string;
  ink: string;
  muted: string;
  primary: string;
  primaryDark: string;
  coral: string;
  gold: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  border: string;
  borderStrong: string;
};

export const lightColors: ThemeColors = {
  bg: "#FFF8F2",
  bgAccent: "#F3EEFF",
  surface: "#FFFFFF",
  ink: "#1B1630",
  muted: "#5E5878",
  primary: "#6D5DF6",
  primaryDark: "#5548D9",
  coral: "#FF7A59",
  gold: "#FFC857",
  success: "#16A34A",
  successBg: "#ECFDF3",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  border: "#E8E0F5",
  borderStrong: "#C4B5FD",
};

export const darkColors: ThemeColors = {
  bg: "#12101C",
  bgAccent: "#221E33",
  surface: "#1C1829",
  ink: "#F4F0FF",
  muted: "#A8A0C3",
  primary: "#8B7DFF",
  primaryDark: "#6D5DF6",
  coral: "#FF8F74",
  gold: "#FFD06A",
  success: "#4ADE80",
  successBg: "#14281F",
  danger: "#F87171",
  dangerBg: "#2A1518",
  border: "#342F4A",
  borderStrong: "#5B4FD6",
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === "dark" ? darkColors : lightColors;
}

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#6D5DF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  soft: {
    shadowColor: "#1B1630",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const colors = lightColors;
