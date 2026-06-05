import { useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { optionDisplayLabel, type QuizOption } from "@asebili/database/quiz";
import type { PublicQuizQuestion } from "@asebili/database/types";
import { LibrasVideo } from "./libras-video";
import { layout } from "../layout";
import { radii, type ThemeColors } from "../theme";

type QuizTaskHintProps = {
  mode?: PublicQuizQuestion["promptMode"];
  colors: ThemeColors;
  t: (path: string) => string;
};

export function QuizTaskHint({ colors, mode, t }: QuizTaskHintProps) {
  const styles = useMemo(() => createHintStyles(colors), [colors]);
  const isColorPick = mode === "color-pick";

  return (
    <View style={styles.row} accessibilityRole="text">
      <Text style={styles.icon}>{isColorPick ? "🎨" : "🤟"}</Text>
      <Text style={styles.arrow}>→</Text>
      <Text style={styles.icon}>{isColorPick ? "📝" : "🎨"}</Text>
      <Text style={styles.caption}>
        {isColorPick
          ? t("mobile.quizTaskColorToWord")
          : t("mobile.quizTaskSignToColor")}
      </Text>
    </View>
  );
}

type QuizPromptStimulusProps = {
  question: PublicQuizQuestion;
  colors: ThemeColors;
};

export function QuizPromptStimulus({
  colors,
  question,
}: QuizPromptStimulusProps) {
  const styles = useMemo(() => createPromptStyles(colors), [colors]);

  if (question.promptVideoUrl) {
    return (
      <View style={styles.block}>
        {question.promptColor ? (
          <View
            style={[
              styles.colorDisc,
              { backgroundColor: question.promptColor },
            ]}
          />
        ) : null}
        <LibrasVideo sourceUrl={question.promptVideoUrl} />
      </View>
    );
  }

  if (question.promptColor) {
    return (
      <View style={styles.block}>
        <View
          style={[styles.colorDisc, { backgroundColor: question.promptColor }]}
        />
      </View>
    );
  }

  if (question.promptImageUrl) {
    return (
      <View style={styles.block}>
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: question.promptImageUrl }}
          style={styles.promptImage}
        />
      </View>
    );
  }

  if (question.promptSymbol) {
    return <Text style={styles.symbolOnly}>{question.promptSymbol}</Text>;
  }

  if (question.prompt?.trim()) {
    return <Text style={styles.legacyPrompt}>{question.prompt}</Text>;
  }

  return null;
}

type QuizOptionGridProps = {
  question: PublicQuizQuestion;
  selectedId?: string;
  colors: ThemeColors;
  onSelect: (optionId: string) => void;
};

export function resolveOptionVariant(
  question: PublicQuizQuestion,
): "color" | "symbol" | "text" {
  if (
    question.promptMode === "sign-pick" ||
    question.promptMode === "color-pick"
  ) {
    return "text";
  }

  if (question.options.some((option) => option.color)) {
    return "color";
  }

  return "symbol";
}

export function QuizOptionGrid({
  colors,
  onSelect,
  question,
  selectedId,
}: QuizOptionGridProps) {
  const styles = useMemo(() => createOptionStyles(colors), [colors]);
  const variant = resolveOptionVariant(question);

  return (
    <View
      style={[
        styles.grid,
        variant === "color" && styles.gridColor,
        variant === "text" && styles.gridText,
      ]}
    >
      {question.options.map((option) => (
        <QuizOptionCard
          key={option.id}
          colors={colors}
          option={option}
          selected={selectedId === option.id}
          variant={variant}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </View>
  );
}

type QuizOptionCardProps = {
  option: QuizOption;
  selected: boolean;
  colors: ThemeColors;
  variant: "color" | "symbol" | "text";
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function QuizOptionCard({
  colors,
  onPress,
  option,
  selected,
  style,
  variant,
}: QuizOptionCardProps) {
  const styles = useMemo(() => createOptionStyles(colors), [colors]);
  const label = optionDisplayLabel(option);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variant === "text" && styles.cardTextOnly,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      {variant === "color" && option.color ? (
        <View style={[styles.swatch, { backgroundColor: option.color }]}>
          {option.symbol ? (
            <Text style={styles.swatchSymbol}>{option.symbol}</Text>
          ) : null}
        </View>
      ) : null}

      {variant !== "text" && option.imageUrl ? (
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: option.imageUrl }}
          style={styles.optionImage}
        />
      ) : null}

      {variant !== "text" && !option.color && !option.imageUrl && option.symbol ? (
        <Text style={styles.optionSymbol}>{option.symbol}</Text>
      ) : null}

      {variant !== "text" && option.videoUrl ? (
        <View style={styles.miniVideo}>
          <LibrasVideo sourceUrl={option.videoUrl} />
        </View>
      ) : null}

      {label && label !== "—" ? (
        <Text
          style={[
            styles.optionLabel,
            variant === "text" && styles.optionLabelTextOnly,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function createHintStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    icon: { fontSize: 28 },
    arrow: { color: colors.muted, fontSize: 22, fontWeight: "900" },
    caption: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      width: "100%",
    },
  });
}

function createPromptStyles(colors: ThemeColors) {
  const discSize = layout.stimulusColorDiscSize;

  return StyleSheet.create({
    block: { alignItems: "center", gap: 6, width: "100%" },
    symbol: { fontSize: 32, textAlign: "center" },
    symbolLarge: { fontSize: 40 },
    symbolOnly: {
      color: colors.ink,
      fontSize: 72,
      textAlign: "center",
    },
    colorDisc: {
      borderColor: colors.borderStrong,
      borderRadius: 999,
      borderWidth: 2,
      height: discSize,
      width: discSize,
    },
    promptImage: {
      borderRadius: radii.md,
      height: 160,
      width: "100%",
      maxWidth: 280,
    },
    legacyPrompt: {
      color: colors.ink,
      fontSize: 18,
      fontWeight: "800",
      textAlign: "center",
    },
  });
}

function createOptionStyles(colors: ThemeColors) {
  return StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: layout.quizOptionGap,
      justifyContent: "space-between",
      width: "100%",
    },
    gridColor: {},
    gridText: {},
    card: {
      alignItems: "center",
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 2,
      backgroundColor: colors.surface,
      flexGrow: 0,
      flexShrink: 0,
      gap: 6,
      minHeight: 92,
      paddingHorizontal: 10,
      paddingVertical: 12,
      width: "48%",
    },
    cardTextOnly: {
      justifyContent: "center",
      minHeight: 88,
      paddingVertical: 14,
    },
    cardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.bgAccent,
      borderWidth: 3,
    },
    cardPressed: { opacity: 0.92 },
    swatch: {
      alignItems: "center",
      borderRadius: radii.md,
      height: 72,
      justifyContent: "center",
      width: "100%",
    },
    swatchSymbol: { fontSize: 28 },
    optionImage: {
      borderRadius: radii.sm,
      height: 56,
      width: "100%",
    },
    optionSymbol: { fontSize: 40 },
    miniVideo: { height: 80, overflow: "hidden", width: "100%" },
    optionLabel: {
      color: colors.ink,
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.3,
      textTransform: "lowercase",
    },
    optionLabelTextOnly: {
      flexShrink: 1,
      fontSize: 20,
      includeFontPadding: false,
      lineHeight: 26,
      textAlign: "center",
      textAlignVertical: "center",
      width: "100%",
    },
  });
}
