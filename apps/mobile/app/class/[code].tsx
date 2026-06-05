import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { PublicActivity } from "@asebili/database/types";
import {
  formatMessage,
  localizeActivityTitle,
  localizeClassName,
} from "@asebili/i18n";
import {
  MissionListCard,
  missionProgressPercent,
} from "../../src/components/mission-list-card";
import { PreferencesBar } from "../../src/components/preferences-bar";
import { usePreferences } from "../../src/contexts/preferences-context";
import { joinClass } from "../../src/lib/api";
import { saveClassSession } from "../../src/lib/class-session";
import { getStudentName, normalizeStudentName } from "../../src/lib/student-profile";
import {
  getClassMissionProgress,
  type MissionCompletion,
} from "../../src/lib/mission-progress";
import { layout } from "../../src/layout";
import { radii, shadows, type ThemeColors } from "../../src/theme";

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: {
      flexGrow: 1,
      paddingBottom: layout.pagePadding,
      paddingHorizontal: layout.pagePadding,
      paddingTop: layout.pagePadding,
    },
    inner: {
      width: "100%",
      maxWidth: layout.contentMaxWidth,
      alignSelf: "center",
      gap: 14,
    },
    panel: {
      gap: 12,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 2,
      backgroundColor: colors.surface,
      padding: layout.panelPadding,
      ...shadows.card,
    },
    title: {
      color: colors.ink,
      fontSize: 24,
      fontWeight: "900",
    },
    subtitle: { color: colors.muted, fontSize: 16, lineHeight: 22 },
    progressSummary: {
      color: colors.primaryDark,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    progressTrack: {
      backgroundColor: colors.border,
      borderRadius: radii.pill,
      height: 10,
      overflow: "hidden",
      width: "100%",
    },
    progressFill: {
      backgroundColor: colors.success,
      borderRadius: radii.pill,
      height: "100%",
    },
    list: { gap: 10 },
    error: {
      borderColor: "rgba(220, 38, 38, 0.25)",
      borderRadius: radii.sm,
      borderWidth: 2,
      backgroundColor: colors.dangerBg,
      color: colors.danger,
      fontWeight: "700",
      padding: 12,
    },
  });
}

function templateLabel(activity: PublicActivity, t: (path: string) => string) {
  const key = `mobile.templates.${activity.templateType}`;
  const label = t(key);
  return label === key ? activity.templateType : label;
}

function activityReady(activity: PublicActivity) {
  return (
    activity.templateType === "quiz" &&
    (activity.quizQuestions?.length ?? 0) > 0
  );
}

export default function ClassActivitiesScreen() {
  const router = useRouter();
  const { colors, t, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { code, className, studentName } = useLocalSearchParams<{
    code?: string;
    className?: string;
    studentName?: string;
  }>();
  const accessCode = useMemo(
    () => (Array.isArray(code) ? code[0] : code)?.trim().toUpperCase() ?? "",
    [code],
  );
  const displayClassName = useMemo(
    () => (Array.isArray(className) ? className[0] : className) ?? "",
    [className],
  );
  const routeStudentName = useMemo(
    () =>
      normalizeStudentName(
        (Array.isArray(studentName) ? studentName[0] : studentName) ?? "",
      ),
    [studentName],
  );
  const [activeStudentName, setActiveStudentName] = useState(routeStudentName);
  const [activities, setActivities] = useState<PublicActivity[]>([]);
  const [classId, setClassId] = useState("");
  const [loadedClassName, setLoadedClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completions, setCompletions] = useState<
    Record<string, MissionCompletion>
  >({});

  const readyActivities = useMemo(
    () => activities.filter(activityReady),
    [activities],
  );
  const showBlockedMission = readyActivities.length === 1;
  const totalMissions = readyActivities.length + (showBlockedMission ? 1 : 0);
  const completedCount = readyActivities.filter(
    (activity) => completions[activity.id],
  ).length;
  const overallProgress =
    totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  useEffect(() => {
    if (routeStudentName) {
      setActiveStudentName(routeStudentName);
      return;
    }
    void getStudentName().then((savedName) => {
      if (savedName) setActiveStudentName(savedName);
    });
  }, [routeStudentName]);

  const refreshProgress = useCallback(async () => {
    if (!accessCode && !classId) return;
    const progress = await getClassMissionProgress(accessCode, classId);
    setCompletions(progress);
  }, [accessCode, classId]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!accessCode) return;
      setLoading(true);
      setError("");
      try {
        const payload = await joinClass(accessCode);
        if (!active) return;
        setClassId(payload.class.id);
        setLoadedClassName(payload.class.name);
        await saveClassSession({
          code: accessCode,
          classId: payload.class.id,
          className: payload.class.name,
          studentName: activeStudentName || routeStudentName || undefined,
        });
        const sorted = [...payload.activities].sort((a, b) => {
          const aReady = activityReady(a) ? 0 : 1;
          const bReady = activityReady(b) ? 0 : 1;
          return aReady - bReady;
        });
        setActivities(sorted);
        const progress = await getClassMissionProgress(
          accessCode,
          payload.class.id,
        );
        if (active) setCompletions(progress);
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

    void load();
    return () => {
      active = false;
    };
  }, [accessCode, t]);

  useFocusEffect(
    useCallback(() => {
      void refreshProgress();
    }, [refreshProgress]),
  );

  function openActivity(activity: PublicActivity) {
    if (!activityReady(activity)) return;
    void saveClassSession({
      code: accessCode,
      classId,
      className: loadedClassName || displayClassName,
      studentName: activeStudentName || undefined,
    });
    router.push({
      pathname: "/activity/[id]",
      params: {
        id: activity.id,
        classId,
        classCode: accessCode,
        className: loadedClassName || displayClassName,
        studentName: activeStudentName,
      },
    });
  }

  function missionMeta(
    activity: PublicActivity,
    completion: MissionCompletion | undefined,
  ) {
    if (completion) {
      return formatMessage(t("mobile.missionCompletedMeta"), {
        score: completion.scorePercent,
      });
    }

    return formatMessage(t("mobile.activityQuizReady"), {
      count: activity.quizQuestions?.length ?? 0,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PreferencesBar />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.panel}>
            <Text style={styles.title}>
              {(loadedClassName || displayClassName)
                ? localizeClassName(
                    loadedClassName || displayClassName,
                    language,
                  )
                : t("mobile.classFallback")}
            </Text>
            <Text style={styles.subtitle}>{t("mobile.pickActivity")}</Text>

            {totalMissions > 0 ? (
              <View style={{ gap: 8 }}>
                <Text style={styles.progressSummary}>
                  {formatMessage(t("mobile.missionsProgress"), {
                    completed: completedCount,
                    total: totalMissions,
                  })}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${overallProgress}%` },
                    ]}
                  />
                </View>
              </View>
            ) : null}

            {loading ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.list}>
              {readyActivities.map((activity) => {
                const completion = completions[activity.id];
                const completed = Boolean(completion);

                return (
                  <MissionListCard
                    key={activity.id}
                    badge={templateLabel(activity, t)}
                    colors={colors}
                    meta={missionMeta(activity, completion)}
                    progressPercent={missionProgressPercent(completion, false)}
                    state={completed ? "completed" : "available"}
                    title={localizeActivityTitle(activity.title, language)}
                    t={t}
                    onPress={() => openActivity(activity)}
                  />
                );
              })}

              {showBlockedMission ? (
                <MissionListCard
                  badge={t("mobile.missionLockedBadge")}
                  colors={colors}
                  meta={t("mobile.missionLockedBody")}
                  progressPercent={0}
                  state="locked"
                  title={t("mobile.missionLockedTitle")}
                  t={t}
                />
              ) : null}

              {activities
                .filter((activity) => !activityReady(activity))
                .map((activity) => (
                  <MissionListCard
                    key={activity.id}
                    badge={templateLabel(activity, t)}
                    colors={colors}
                    meta={t("mobile.activityNotOnMobile")}
                    progressPercent={0}
                    state="locked"
                    title={localizeActivityTitle(activity.title, language)}
                    t={t}
                  />
                ))}
            </View>

            {activities.length === 0 && !loading ? (
              <Text style={styles.subtitle}>{t("mobile.noActivities")}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
