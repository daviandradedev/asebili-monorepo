import { StyleSheet, View } from "react-native";
import type { ThemeColors } from "../theme";
import { lightColors } from "../theme";

type AsebiliLogoProps = {
  size?: number;
  colors?: ThemeColors;
};

const BASE = 48;

export function AsebiliLogo({
  size = 48,
  colors = lightColors,
}: AsebiliLogoProps) {
  const scale = size / BASE;

  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityRole="image"
      accessibilityLabel="Asebili"
    >
      <View style={[styles.frame, { transform: [{ scale }] }]}>
        <View style={[styles.ear, styles.earLeft, { backgroundColor: colors.primary }]}>
          <View style={[styles.earInner, { backgroundColor: colors.coral }]} />
        </View>
        <View style={[styles.ear, styles.earRight, { backgroundColor: colors.primary }]}>
          <View style={[styles.earInner, { backgroundColor: colors.coral }]} />
        </View>
        <View
          style={[
            styles.head,
            {
              borderColor: colors.primary,
              backgroundColor: colors.bg,
            },
          ]}
        >
          <View style={[styles.eyeLeft, { backgroundColor: colors.ink }]} />
          <View style={[styles.eyeRight, { backgroundColor: colors.ink }]} />
          <View style={[styles.nose, { backgroundColor: colors.coral }]} />
          <View style={[styles.cheek, styles.cheekLeft, { backgroundColor: colors.gold }]} />
          <View style={[styles.cheek, styles.cheekRight, { backgroundColor: colors.gold }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: BASE,
    height: BASE,
    position: "relative",
    overflow: "visible",
  },
  ear: {
    position: "absolute",
    top: 0,
    width: 14,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    paddingTop: 6,
  },
  earLeft: {
    left: 6,
  },
  earRight: {
    right: 6,
  },
  earInner: {
    width: 7,
    height: 16,
    borderRadius: 6,
  },
  head: {
    position: "absolute",
    top: 14,
    left: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  eyeLeft: {
    position: "absolute",
    top: 12,
    left: 9,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  eyeRight: {
    position: "absolute",
    top: 12,
    right: 9,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  nose: {
    position: "absolute",
    top: 19,
    left: 14,
    width: 8,
    height: 6,
    borderRadius: 4,
  },
  cheek: {
    position: "absolute",
    top: 18,
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.55,
  },
  cheekLeft: {
    left: 4,
  },
  cheekRight: {
    right: 4,
  },
});
