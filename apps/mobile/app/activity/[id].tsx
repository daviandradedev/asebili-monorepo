import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import type { PublicActivity } from "@asebili/database/types";
import {
  localizeActivityTitle,
  localizeClassName,
} from "@asebili/i18n";
import { PreferencesBar } from "../../src/components/preferences-bar";
import { QuizSession } from "../../src/components/quiz-session";
import { usePreferences } from "../../src/contexts/preferences-context";
import { getActivity } from "../../src/lib/api";
import { saveClassSession } from "../../src/lib/class-session";
import { getStudentName, normalizeStudentName } from "../../src/lib/student-profile";
import { layout } from "../../src/layout";
import { radii, shadows, type ThemeColors } from "../../src/theme";

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: layout.pagePadding,
      paddingHorizontal: layout.pagePadding,
      paddingTop: layout.pagePadding,
    },
    scrollInner: {
      width: "100%",
      maxWidth: layout.contentMaxWidth,
      alignSelf: "center",
      gap: 16,
    },
    panel: {
      gap: 14,
      width: "100%",
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 2,
      backgroundColor: colors.surface,
      padding: layout.panelPadding,
      ...shadows.card,
    },
    classBadge: {
      alignSelf: "flex-start",
      borderRadius: radii.pill,
      backgroundColor: colors.bgAccent,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    classBadgeText: {
      color: colors.primaryDark,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    missionLabel: {
      color: colors.coral,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    title: {
      color: colors.ink,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    subtitle: {
      color: colors.muted,
      fontSize: 18,
      lineHeight: 26,
    },
    error: {
      borderColor: "rgba(220, 38, 38, 0.25)",
      borderRadius: radii.sm,
      borderWidth: 2,
      backgroundColor: colors.dangerBg,
      color: colors.danger,
      fontWeight: "700",
      padding: 12,
    },
    unavailable: {
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 2,
      backgroundColor: colors.bgAccent,
      gap: 8,
      padding: 14,
    },
    unavailableText: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 22,
    },
  });
}

function hasQuizQuestions(activity: PublicActivity | null) {
  return (activity?.quizQuestions?.length ?? 0) > 0;
}

export default function ActivityScreen() {
  const { colors, t, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, classId, classCode, className, studentName } = useLocalSearchParams<{
    id: string;
    classId?: string;
    classCode?: string;
    className?: string;
    studentName?: string;
  }>();
  const [activity, setActivity] = useState<PublicActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activityId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const activeClassId = useMemo(
    () => (Array.isArray(classId) ? classId[0] : classId),
    [classId],
  );
  const activeClassName = useMemo(
    () => (Array.isArray(className) ? className[0] : className),
    [className],
  );
  const activeClassCode = useMemo(
    () => (Array.isArray(classCode) ? classCode[0] : classCode)?.trim().toUpperCase(),
    [classCode],
  );
  const routeStudentName = useMemo(
    () =>
      normalizeStudentName(
        (Array.isArray(studentName) ? studentName[0] : studentName) ?? "",
      ),
    [studentName],
  );
  const [activeStudentName, setActiveStudentName] = useState(routeStudentName);
  const isQuiz = activity?.templateType === "quiz";
  const quizReady = hasQuizQuestions(activity);

  useEffect(() => {
    if (routeStudentName) {
      setActiveStudentName(routeStudentName);
      return;
    }
    void getStudentName().then((savedName) => {
      if (savedName) setActiveStudentName(savedName);
    });
  }, [routeStudentName]);

  useEffect(() => {
    if (activeClassCode) {
      void saveClassSession({
        code: activeClassCode,
        classId: activeClassId,
        className: activeClassName,
        studentName: activeStudentName || undefined,
      });
    }
  }, [activeClassCode, activeClassId, activeClassName, activeStudentName]);

  useEffect(() => {
    let active = true;

    async function loadActivity() {
      if (!activityId) return;

      setLoading(true);
      setError("");

      try {
        const payload = await getActivity(activityId);
        if (active) setActivity(payload.activity);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("mobile.loadActivityFailed"),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadActivity();

    return () => {
      active = false;
    };
  }, [activityId, t]);

  return (
    <SafeAreaView style={styles.safe}>
      <PreferencesBar />
      <ScrollView contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollInner}>
          <View style={styles.panel}>
            <View style={styles.classBadge}>
              <Text style={styles.classBadgeText}>
                {activeClassName
                  ? localizeClassName(activeClassName, language)
                  : t("mobile.classFallback")}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : null}

            {activity ? (
              <>
                <Text style={styles.missionLabel}>{t("mobile.mission")}</Text>
                <Text style={styles.title} accessibilityRole="header">
                  {localizeActivityTitle(activity.title, language)}
                </Text>

                {isQuiz && quizReady ? (
                  <QuizSession
                    activity={activity}
                    classCode={activeClassCode}
                    classId={activeClassId}
                    className={activeClassName}
                    studentName={activeStudentName}
                    colors={colors}
                    t={t}
                  />
                ) : (
                  <View style={styles.unavailable}>
                    <Text style={styles.unavailableText}>
                      {isQuiz
                        ? t("mobile.quizUnavailable")
                        : t("mobile.activityTypeUnavailable")}
                    </Text>
                  </View>
                )}
              </>
            ) : null}

            {!loading && !activity && !error ? (
              <Text style={styles.subtitle}>{t("mobile.notFound")}</Text>
            ) : null}
            {!activity && error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
