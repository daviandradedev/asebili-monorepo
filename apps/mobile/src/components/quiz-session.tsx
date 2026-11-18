import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { notify } from "../lib/haptics";
import { optionDisplayLabel } from "@asebili/database/quiz";
import { formatMessage } from "@asebili/i18n";
import type {
  PublicActivity,
  PublicQuizQuestion,
  QuizAnswerDetail,
} from "@asebili/database/types";
import { LibrasVideo } from "./libras-video";
import {
  QuizOptionCard,
  QuizOptionGrid,
  QuizPromptStimulus,
  QuizTaskHint,
  resolveOptionVariant,
} from "./quiz-visual";
import { submitPerformanceLog } from "../lib/api";
import { markMissionCompleted } from "../lib/mission-progress";
import { navigateToMissionList } from "../lib/navigate-to-missions";
import { layout } from "../layout";
import { radii, shadows, type ThemeColors } from "../theme";

type Phase = "intro" | "question" | "review" | "completed";

type QuizSessionProps = {
  activity: PublicActivity;
  classCode?: string;
  classId?: string;
  className?: string;
  studentName: string;
  colors: ThemeColors;
  t: (path: string) => string;
};

type CompletedState = {
  correctAnswers: number;
  wrongAnswers: number;
  scorePercent: number;
  gradedAnswers: QuizAnswerDetail[];
};

function createStyles(colors: ThemeColors, compact: boolean) {
  const actionButton = {
    alignItems: "center" as const,
    borderRadius: radii.md,
    justifyContent: "center" as const,
    minHeight: layout.actionButtonMinHeight,
    paddingHorizontal: 14,
    paddingVertical: 12,
  };

  return StyleSheet.create({
    gap: { gap: 14 },
    progress: {
      color: colors.primaryDark,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    options: { gap: 10 },
    navRow: {
      flexDirection: compact ? "column" : "row",
      gap: layout.quizOptionGap,
      marginTop: 4,
      width: "100%",
    },
    navButton: {
      ...actionButton,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flex: compact ? undefined : 1,
      width: compact ? "100%" : undefined,
    },
    navButtonPrimary: {
      ...actionButton,
      backgroundColor: colors.primary,
      flex: compact ? undefined : 1,
      width: compact ? "100%" : undefined,
      ...shadows.soft,
    },
    navButtonPressed: { opacity: 0.9 },
    navButtonDisabled: { opacity: 0.45 },
    navButtonText: {
      color: colors.ink,
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 20,
      textAlign: "center",
    },
    navButtonTextPrimary: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 20,
      textAlign: "center",
    },
    reviewList: { gap: 10 },
    reviewItem: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
    },
    reviewIndex: {
      color: colors.primaryDark,
      fontSize: 18,
      fontWeight: "900",
      width: 28,
    },
    reviewBody: { flex: 1, gap: 4 },
    reviewEdit: {
      color: colors.primaryDark,
      fontSize: 13,
      fontWeight: "800",
    },
    resultList: { gap: 8, width: "100%" },
    resultItem: {
      alignItems: "center",
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 2,
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    resultItemCorrect: {
      backgroundColor: "rgba(34, 197, 94, 0.08)",
      borderColor: "rgba(34, 197, 94, 0.35)",
    },
    resultItemWrong: {
      backgroundColor: colors.dangerBg,
      borderColor: "rgba(220, 38, 38, 0.25)",
    },
    resultIndex: {
      color: colors.primaryDark,
      fontSize: 16,
      fontWeight: "900",
      width: 24,
    },
    resultLabel: {
      color: colors.ink,
      flex: 1,
      fontSize: 16,
      fontWeight: "800",
      textTransform: "lowercase",
    },
    resultBadge: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    resultBadgeCorrect: { color: "#15803d" },
    resultBadgeWrong: { color: colors.danger },
    completedCard: {
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.borderStrong,
      borderRadius: radii.lg,
      backgroundColor: colors.bgAccent,
      gap: 8,
      padding: layout.panelPadding,
    },
    completedScore: {
      color: colors.primaryDark,
      fontSize: 42,
      fontWeight: "900",
    },
    completedSubtitle: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 22,
      textAlign: "center",
    },
    primaryWide: {
      ...actionButton,
      backgroundColor: colors.primary,
      marginTop: 8,
      width: "100%",
      ...shadows.soft,
    },
    primaryWideText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "800",
      lineHeight: 20,
      textAlign: "center",
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
    introHint: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 22,
      textAlign: "center",
    },
  });
}

export function QuizSession({
  activity,
  classCode,
  classId,
  className,
  studentName,
  colors,
  t,
}: QuizSessionProps) {
  const router = useRouter();
  const questions = activity.quizQuestions ?? [];
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const styles = useMemo(() => createStyles(colors, compact), [colors, compact]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<CompletedState | null>(null);

  const currentQuestion = questions[questionIndex];
  const total = questions.length;
  const allAnswered = questions.every((question) => selections[question.id]);

  function selectedOption(question: PublicQuizQuestion, optionId: string) {
    return question.options.find((option) => option.id === optionId);
  }

  function selectOption(questionId: string, optionId: string) {
    setSelections((current) => ({ ...current, [questionId]: optionId }));
  }

  function handleBackToMission() {
    void navigateToMissionList(router, { classCode, className });
  }

  async function handleSubmit() {
    if (!allAnswered) {
      setError(t("mobile.quizAllRequired"));
      return;
    }

    if (studentName.trim().length < 2) {
      setError(t("mobile.studentNameRequired"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const answers = questions.map((question) => ({
        questionId: question.id,
        selectedOptionId: selections[question.id] ?? "",
      }));

      const payload = await submitPerformanceLog({
        activityId: activity.id,
        classId,
        studentName: studentName.trim(),
        responseTimeSeconds: Math.max(
          0,
          Math.round((Date.now() - startedAt) / 1000),
        ),
        answerDetails: { answers, scorePercent: 0 },
      });

      const gradedAnswers = payload.log.answerDetails?.answers ?? [];
      const correctAnswers =
        gradedAnswers.length > 0
          ? gradedAnswers.filter((answer) => answer.correct).length
          : (payload.log.correctAnswers ?? 0);
      const wrongAnswers =
        gradedAnswers.length > 0
          ? gradedAnswers.length - correctAnswers
          : (payload.log.wrongAnswers ?? 0);
      const scorePercent =
        payload.log.answerDetails?.scorePercent ??
        payload.log.scorePercent ??
        (total > 0 ? Math.round((correctAnswers / total) * 100) : 0);

      setCompleted({
        correctAnswers,
        wrongAnswers,
        scorePercent,
        gradedAnswers,
      });
      await markMissionCompleted({
        activityId: activity.id,
        classCode,
        classId,
        scorePercent,
        correctAnswers,
        totalQuestions: total,
      });
      setPhase("completed");
      await notify(Haptics.NotificationFeedbackType.Success);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("mobile.saveFailed"),
      );
      await notify(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  }

  if (questions.length === 0) {
    return <Text style={styles.error}>{t("mobile.quizUnavailable")}</Text>;
  }

  if (phase === "intro") {
    return (
      <View style={styles.gap}>
        <Text style={styles.introHint}>{t("mobile.quizIntroVisual")}</Text>
        <LibrasVideo sourceUrl={activity.librasVideoUrl} />
        <Pressable
          style={({ pressed }) => [
            styles.primaryWide,
            pressed && styles.navButtonPressed,
          ]}
          onPress={() => setPhase("question")}
        >
          <Text style={styles.primaryWideText}>{t("mobile.quizStart")}</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "question" && currentQuestion) {
    const selectedId = selections[currentQuestion.id];
    const isLast = questionIndex === total - 1;

    return (
      <View style={styles.gap}>
        <Text style={styles.progress}>
          {formatMessage(t("mobile.quizProgress"), {
            current: questionIndex + 1,
            total,
          })}
        </Text>

        <QuizTaskHint colors={colors} mode={currentQuestion.promptMode} t={t} />
        <QuizPromptStimulus colors={colors} question={currentQuestion} />
        <QuizOptionGrid
          colors={colors}
          question={currentQuestion}
          selectedId={selectedId}
          onSelect={(optionId) => selectOption(currentQuestion.id, optionId)}
        />

        <View style={styles.navRow}>
          <Pressable
            disabled={questionIndex === 0}
            onPress={() => setQuestionIndex((index) => Math.max(0, index - 1))}
            style={({ pressed }) => [
              styles.navButton,
              questionIndex === 0 && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
          >
            <Text style={styles.navButtonText}>{t("mobile.quizPrevious")}</Text>
          </Pressable>
          <Pressable
            disabled={!selectedId}
            onPress={() => {
              if (isLast) setPhase("review");
              else setQuestionIndex((index) => Math.min(total - 1, index + 1));
            }}
            style={({ pressed }) => [
              styles.navButtonPrimary,
              !selectedId && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
          >
            <Text style={styles.navButtonTextPrimary}>
              {isLast ? t("mobile.quizReview") : t("mobile.quizNext")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "review") {
    return (
      <View style={styles.gap}>
        <Text style={styles.progress}>{t("mobile.quizReviewTitle")}</Text>
        <Text style={styles.introHint}>{t("mobile.quizReviewBody")}</Text>

        <View style={styles.reviewList}>
          {questions.map((question, index) => {
            const option = selectedOption(
              question,
              selections[question.id] ?? "",
            );
            const variant = resolveOptionVariant(question);

            return (
              <Pressable
                key={question.id}
                style={styles.reviewItem}
                onPress={() => {
                  setQuestionIndex(index);
                  setPhase("question");
                }}
              >
                <Text style={styles.reviewIndex}>{index + 1}</Text>
                <View style={styles.reviewBody}>
                  {option ? (
                    <QuizOptionCard
                      colors={colors}
                      option={option}
                      selected
                      variant={variant}
                      onPress={() => {}}
                      style={{ width: "100%" }}
                    />
                  ) : null}
                  <Text style={styles.reviewEdit}>
                    {t("mobile.quizEditAnswer")}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.navRow}>
          <Pressable
            onPress={() => {
              setQuestionIndex(total - 1);
              setPhase("question");
            }}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>
              {t("mobile.quizBackToQuiz")}
            </Text>
          </Pressable>
          <Pressable
            disabled={saving || !allAnswered}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.navButtonPrimary,
              (saving || !allAnswered) && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.navButtonTextPrimary}>
                {t("mobile.quizConfirmSubmit")}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "completed" && completed) {
    return (
      <View style={styles.gap}>
        <View style={styles.completedCard}>
          <Text style={styles.progress}>{t("mobile.quizCompletedTitle")}</Text>
          <Text style={styles.completedScore}>{completed.scorePercent}%</Text>
          <Text style={styles.completedSubtitle}>
            {formatMessage(t("mobile.quizCompletedBody"), {
              correct: completed.correctAnswers,
              total,
            })}
          </Text>
        </View>

        <View style={styles.resultList}>
          {questions.map((question, index) => {
            const graded = completed.gradedAnswers.find(
              (answer) => answer.questionId === question.id,
            );
            const selected = selectedOption(
              question,
              graded?.selectedOptionId ?? selections[question.id] ?? "",
            );
            const label = selected ? optionDisplayLabel(selected) : "—";
            const isCorrect = graded?.correct ?? false;

            return (
              <View
                key={question.id}
                style={[
                  styles.resultItem,
                  isCorrect ? styles.resultItemCorrect : styles.resultItemWrong,
                ]}
              >
                <Text style={styles.resultIndex}>{index + 1}</Text>
                <Text style={styles.resultLabel}>{label}</Text>
                <Text
                  style={[
                    styles.resultBadge,
                    isCorrect
                      ? styles.resultBadgeCorrect
                      : styles.resultBadgeWrong,
                  ]}
                >
                  {isCorrect
                    ? t("mobile.quizAnswerCorrect")
                    : t("mobile.quizAnswerWrong")}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleBackToMission}
          style={({ pressed }) => [
            styles.primaryWide,
            pressed && styles.navButtonPressed,
          ]}
        >
          <Text style={styles.primaryWideText}>{t("mobile.backToMission")}</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}
