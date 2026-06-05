import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePreferences } from "../contexts/preferences-context";
import { layout } from "../layout";
import type { ThemeColors } from "../theme";

const TOGGLE_WIDTH = 64;
const TOGGLE_HEIGHT = 36;
const TOGGLE_BORDER_WIDTH = 1;
const THUMB_SIZE = 28;
const TRACK_INSET = 4;
const THUMB_TRAVEL =
  TOGGLE_WIDTH - TOGGLE_BORDER_WIDTH * 2 - TRACK_INSET * 2 - THUMB_SIZE;

type PreferenceToggleProps = {
  accessibilityLabel: string;
  checked: boolean;
  colors: ThemeColors;
  onPress: () => void;
  children: ReactNode;
};

function PreferenceToggle({
  accessibilityLabel,
  checked,
  children,
  colors,
  onPress,
}: PreferenceToggleProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggle,
        { borderColor: colors.border, backgroundColor: colors.bgAccent },
        pressed && styles.togglePressed,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            backgroundColor: colors.surface,
            transform: [{ translateX: checked ? THUMB_TRAVEL : 0 }],
          },
        ]}
      />
      <View pointerEvents="none" style={styles.labels}>
        {children}
      </View>
    </Pressable>
  );
}

export function PreferencesBar() {
  const { language, setLanguage, theme, toggleTheme, colors, t } =
    usePreferences();
  const isPortuguese = language === "pt";
  const isDark = theme === "dark";

  return (
    <View style={styles.bar}>
      <PreferenceToggle
        accessibilityLabel={t("preferences.language")}
        checked={isPortuguese}
        colors={colors}
        onPress={() => setLanguage(isPortuguese ? "en" : "pt")}
      >
        <View style={styles.mark}>
          <Text style={styles.flagText}>🇺🇸</Text>
        </View>
        <View style={styles.mark}>
          <Text style={styles.flagText}>🇧🇷</Text>
        </View>
      </PreferenceToggle>

      <PreferenceToggle
        accessibilityLabel={t("preferences.theme")}
        checked={isDark}
        colors={colors}
        onPress={toggleTheme}
      >
        <View style={styles.mark}>
          <Feather
            name="sun"
            size={16}
            color={isDark ? colors.muted : "#f59e0b"}
          />
        </View>
        <View style={styles.mark}>
          <Feather
            name="moon"
            size={16}
            color={isDark ? "#60a5fa" : colors.muted}
          />
        </View>
      </PreferenceToggle>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    minHeight: TOGGLE_HEIGHT + 16,
    paddingBottom: 8,
    paddingHorizontal: layout.pagePadding,
    paddingTop: 8,
    width: "100%",
  },
  toggle: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: 999,
    borderWidth: TOGGLE_BORDER_WIDTH,
    flexShrink: 0,
    overflow: "hidden",
  },
  togglePressed: {
    opacity: 0.9,
  },
  thumb: {
    position: "absolute",
    top: TRACK_INSET,
    left: TRACK_INSET,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  labels: {
    position: "absolute",
    top: TRACK_INSET,
    left: TRACK_INSET,
    right: TRACK_INSET,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: THUMB_SIZE,
  },
  mark: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: {
    fontSize: 16,
    lineHeight: 18,
    textAlign: "center",
  },
});
