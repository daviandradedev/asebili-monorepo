import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MissionCompletion } from "../lib/mission-progress";
import { radii, type ThemeColors } from "../theme";

type MissionListCardProps = {
  colors: ThemeColors;
  title: string;
  meta: string;
  badge: string;
  progressPercent: number;
  state: "available" | "completed" | "locked";
  onPress?: () => void;
  t: (path: string) => string;
};

export function MissionListCard({
  badge,
  colors,
  meta,
  onPress,
  progressPercent,
  state,
  title,
  t,
}: MissionListCardProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locked = state === "locked";
  const completed = state === "completed";

  const content = (
    <>
      <View style={styles.topRow}>
        <Text style={[styles.badge, completed && styles.badgeCompleted, locked && styles.badgeLocked]}>
          {badge}
        </Text>
        {completed ? (
          <Text style={styles.completedMark}>{t("mobile.missionCompleted")}</Text>
        ) : null}
        {locked ? (
          <Text style={styles.lockMark}>🔒</Text>
        ) : null}
      </View>
      <Text style={[styles.title, locked && styles.titleLocked]}>{title}</Text>
      <Text style={[styles.meta, locked && styles.metaLocked]}>{meta}</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            completed && styles.progressFillCompleted,
            locked && styles.progressFillLocked,
            { width: `${Math.max(0, Math.min(100, progressPercent))}%` },
          ]}
        />
      </View>
    </>
  );

  if (locked || !onPress) {
    return (
      <View
        style={[
          styles.card,
          completed && styles.cardCompleted,
          locked && styles.cardLocked,
        ]}
        accessibilityRole="text"
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        completed && styles.cardCompleted,
        pressed && styles.cardPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

export function missionProgressPercent(
  completion: MissionCompletion | undefined,
  locked: boolean,
) {
  if (locked) return 0;
  if (completion) return 100;
  return 0;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 2,
      backgroundColor: colors.bgAccent,
      gap: 6,
      padding: 14,
    },
    cardCompleted: {
      backgroundColor: colors.successBg,
      borderColor: colors.success,
      borderWidth: 3,
    },
    cardLocked: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderStyle: "dashed",
      opacity: 0.72,
    },
    cardPressed: {
      backgroundColor: colors.surface,
    },
    topRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
    },
    badge: {
      alignSelf: "flex-start",
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      color: colors.primaryDark,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.5,
      overflow: "hidden",
      paddingHorizontal: 10,
      paddingVertical: 4,
      textTransform: "uppercase",
    },
    badgeCompleted: {
      backgroundColor: colors.successBg,
      color: colors.success,
    },
    badgeLocked: {
      color: colors.muted,
    },
    completedMark: {
      color: colors.success,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    lockMark: {
      fontSize: 16,
    },
    title: {
      color: colors.ink,
      fontSize: 17,
      fontWeight: "800",
    },
    titleLocked: {
      color: colors.muted,
    },
    meta: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
    },
    metaLocked: {
      fontStyle: "italic",
    },
    progressTrack: {
      backgroundColor: colors.border,
      borderRadius: radii.pill,
      height: 8,
      marginTop: 4,
      overflow: "hidden",
      width: "100%",
    },
    progressFill: {
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      height: "100%",
    },
    progressFillCompleted: {
      backgroundColor: colors.success,
    },
    progressFillLocked: {
      backgroundColor: colors.muted,
      opacity: 0.35,
    },
  });
}
