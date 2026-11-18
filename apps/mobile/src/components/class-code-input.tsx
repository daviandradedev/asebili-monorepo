import { useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import { layout } from "../layout";
import type { ThemeColors } from "../theme";

const CODE_LENGTH = 6;
const SLOT_CHARS = /^[A-Z0-9]$/;
const SLOT_HEIGHT = layout.codeSlotMinHeight;

type ClassCodeInputProps = {
  colors: ThemeColors;
  compact: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (code: string) => void;
  accessibilityLabel: string;
  accessibilityHint: string;
};

function sanitizeChar(raw: string) {
  const upper = raw.toUpperCase();
  for (const char of upper) {
    if (SLOT_CHARS.test(char)) return char;
  }
  return "";
}

function slotTypography(compact: boolean) {
  const fontSize = compact ? 20 : 24;

  if (Platform.OS === "web") {
    return {
      fontSize,
      height: SLOT_HEIGHT,
      lineHeight: SLOT_HEIGHT,
      letterSpacing: 0,
    };
  }

  return {
    fontSize,
    lineHeight: Platform.select({
      ios: fontSize + 4,
      default: SLOT_HEIGHT,
    }),
  };
}

export function ClassCodeInput({
  accessibilityHint,
  accessibilityLabel,
  colors,
  compact,
  onChange,
  onSubmit,
  value,
}: ClassCodeInputProps) {
  const refs = useRef<Array<TextInput | null>>([]);
  const slots = Array.from(
    { length: CODE_LENGTH },
    (_, index) => value[index] ?? "",
  );
  const typography = slotTypography(compact);

  function focusSlot(index: number) {
    refs.current[index]?.focus();
  }

  function normalizeCode(next: string) {
    return next
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, CODE_LENGTH);
  }

  function setCode(next: string) {
    onChange(normalizeCode(next));
  }

  function submitIfComplete(code: string) {
    if (code.length === CODE_LENGTH) {
      onSubmit?.(code);
    }
  }

  function handleChange(index: number, raw: string) {
    const cleaned = sanitizeChar(raw);

    if (!cleaned && raw.length > 1) {
      const pasted = normalizeCode(raw);
      setCode(pasted);
      focusSlot(Math.min(pasted.length, CODE_LENGTH - 1));
      submitIfComplete(pasted);
      return;
    }

    const chars = value.split("");
    while (chars.length < CODE_LENGTH) chars.push("");

    if (!cleaned) {
      chars.splice(index, 1);
      setCode(chars.join(""));
      return;
    }

    if (raw.length > 1) {
      const pasted = normalizeCode(raw);
      setCode(pasted);
      focusSlot(Math.min(pasted.length, CODE_LENGTH - 1));
      submitIfComplete(pasted);
      return;
    }

    chars[index] = cleaned;
    const nextCode = normalizeCode(chars.join(""));

    if (index < CODE_LENGTH - 1) {
      setCode(nextCode);
      focusSlot(index + 1);
      return;
    }

    setCode(nextCode);
    submitIfComplete(nextCode);
  }

  function handleKeyPress(
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) {
    if (event.nativeEvent.key !== "Backspace") return;

    if (slots[index]) {
      const chars = value.split("");
      chars[index] = "";
      setCode(chars.join(""));
      return;
    }

    if (index > 0) {
      const chars = value.split("");
      chars.splice(index - 1, 1);
      setCode(chars.join(""));
      focusSlot(index - 1);
    }
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {slots.map((char, index) => {
        const filled = Boolean(char);
        const active = index === value.length;

        return (
          <Pressable
            key={index}
            onPress={() => focusSlot(index)}
            style={({ pressed }) => [
              styles.slotPressable,
              pressed && styles.slotPressed,
            ]}
          >
            <TextInput
              ref={(node) => {
                refs.current[index] = node;
              }}
              value={char}
              onChangeText={(text) => handleChange(index, text)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              onSubmitEditing={() => {
                if (index === CODE_LENGTH - 1) {
                  submitIfComplete(normalizeCode(value));
                  return;
                }
                focusSlot(index + 1);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              maxLength={CODE_LENGTH}
              returnKeyType={index === CODE_LENGTH - 1 ? "done" : "next"}
              selectTextOnFocus
              style={[
                styles.slotInput,
                typography,
                Platform.OS === "web" && styles.slotInputWeb,
                {
                  borderColor: active
                    ? colors.coral
                    : filled
                      ? colors.primary
                      : colors.border,
                  backgroundColor: filled ? colors.surface : colors.bgAccent,
                  color: colors.ink,
                },
                active && styles.slotInputActive,
              ]}
              textAlign="center"
              textAlignVertical="center"
              {...(Platform.OS === "web"
                ? ({
                    cursorColor: colors.primary,
                    dataSet: { classCodeSlot: "true" },
                  } as const)
                : {})}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: layout.codeSlotGap,
    width: "100%",
  },
  slotPressable: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  slotPressed: {
    opacity: 0.92,
  },
  slotInput: {
    borderRadius: 12,
    borderWidth: 2,
    fontWeight: "900",
    height: SLOT_HEIGHT,
    includeFontPadding: false,
    letterSpacing: Platform.OS === "web" ? 0 : 1,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: "center",
    width: "100%",
  },
  slotInputWeb: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  slotInputActive: {
    shadowColor: "#ff7a59",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
});
