import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { notify } from "../src/lib/haptics";
import { useRouter } from "expo-router";
import { formatMessage, localizeClassName } from "@asebili/i18n";
import { SafeAreaView } from "react-native-safe-area-context";
import { AsebiliLogo } from "../src/components/asebili-logo";
import { ClassCodeInput } from "../src/components/class-code-input";
import { PreferencesBar } from "../src/components/preferences-bar";
import { usePreferences } from "../src/contexts/preferences-context";
import { joinClass } from "../src/lib/api";
import { saveClassSession } from "../src/lib/class-session";
import { getStudentName, saveStudentName } from "../src/lib/student-profile";
import { layout } from "../src/layout";
import { radii, shadows, type ThemeColors } from "../src/theme";

function createStyles(colors: ThemeColors, compact: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    keyboard: {
      flex: 1,
    },
    scroll: {
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
    hero: {
      gap: 12,
      width: "100%",
    },
    panel: {
      gap: 16,
      width: "100%",
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 2,
      backgroundColor: colors.surface,
      padding: layout.panelPadding,
      ...shadows.card,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    brandCopy: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      color: colors.primaryDark,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    brandSubtitle: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "600",
    },
    title: {
      color: colors.ink,
      fontSize: compact ? 24 : 28,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    subtitle: {
      color: colors.muted,
      fontSize: compact ? 16 : 17,
      lineHeight: 24,
    },
    button: {
      alignItems: "center",
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      minHeight: layout.actionButtonMinHeight,
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 12,
      width: "100%",
      ...shadows.soft,
    },
    buttonPressed: {
      backgroundColor: colors.primaryDark,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "800",
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
    fieldGroup: {
      gap: 8,
    },
    fieldLabelText: {
      color: colors.ink,
      fontSize: 14,
      fontWeight: "800",
    },
    nameInput: {
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 2,
      backgroundColor: colors.surface,
      color: colors.ink,
      fontSize: 17,
      fontWeight: "700",
      minHeight: 52,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const { colors, t, language, theme } = usePreferences();
  const styles = useMemo(
    () => createStyles(colors, compact),
    [colors, compact],
  );
  const [accessCode, setAccessCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getStudentName().then((savedName) => {
      if (savedName) setStudentName(savedName);
    });
  }, []);

  async function handleJoinClass(codeInput?: string) {
    if (loading) return;

    const trimmedName = studentName.trim();
    if (trimmedName.length < 2) {
      const message = t("mobile.studentNameRequired");
      setError(message);
      await notify(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("mobile.studentNameRequiredTitle"), message);
      return;
    }

    const code = (codeInput ?? accessCode).trim().toUpperCase();
    if (code.length !== 6) {
      const message = t("mobile.codeIncomplete");
      setError(message);
      await notify(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("mobile.codeIncompleteTitle"), message);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await joinClass(code);

      if (payload.activities.length === 0) {
        const message = t("mobile.noActivities");
        setError(message);
        await notify(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(t("mobile.noActivitiesTitle"), message);
        return;
      }

      await notify(Haptics.NotificationFeedbackType.Success);
      await saveStudentName(trimmedName);
      await saveClassSession({
        code,
        classId: payload.class.id,
        className: payload.class.name,
        studentName: trimmedName,
      });
      router.push({
        pathname: "/class/[code]",
        params: {
          code,
          className: localizeClassName(payload.class.name, language),
          studentName: trimmedName,
        },
      });
    } catch (joinError) {
      const message =
        joinError instanceof Error
          ? joinError.message
          : t("mobile.joinFailed");
      setError(message);
      await notify(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("mobile.classNotFoundTitle"), message);
    } finally {
      setLoading(false);
    }
  }

  const codeA11y = formatMessage(t("mobile.codeA11y"), {
    code: accessCode || t("mobile.codeEmpty"),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <PreferencesBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scrollInner}>
            <View style={styles.hero}>
              <View style={styles.brandRow}>
                <AsebiliLogo size={compact ? 48 : 52} colors={colors} />
                <View style={styles.brandCopy}>
                  <Text style={styles.eyebrow} accessibilityRole="header">
                    ASEBILI
                  </Text>
                  <Text style={styles.brandSubtitle}>
                    {t("mobile.studentMode")}
                  </Text>
                </View>
              </View>

              <Text style={styles.title} accessibilityRole="header">
                {t("mobile.joinTitle")}
              </Text>
              <Text
                style={styles.subtitle}
                accessibilityLanguage={language === "pt" ? "pt-BR" : "en-US"}
              >
                {t("mobile.joinBody")}
              </Text>
            </View>

            <View style={styles.panel}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabelText}>
                {t("mobile.studentNameLabel")}
              </Text>
              <TextInput
                key={`student-name-${theme}`}
                accessibilityLabel={t("mobile.studentNameLabel")}
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect={false}
                cursorColor={colors.primary}
                keyboardAppearance={theme === "dark" ? "dark" : "light"}
                onChangeText={setStudentName}
                placeholder={t("mobile.studentNamePlaceholder")}
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.ink,
                  },
                ]}
                value={studentName}
              />
            </View>

            <ClassCodeInput
              accessibilityHint={t("mobile.codeHint")}
              accessibilityLabel={codeA11y}
              colors={colors}
              compact={compact}
              onChange={setAccessCode}
              onSubmit={handleJoinClass}
              value={accessCode}
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityHint={t("mobile.joinA11y")}
              accessibilityLabel={t("mobile.enterClass")}
              accessibilityRole="button"
              disabled={loading}
              onPress={() => void handleJoinClass()}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>{t("mobile.startChallenge")}</Text>
              )}
            </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
