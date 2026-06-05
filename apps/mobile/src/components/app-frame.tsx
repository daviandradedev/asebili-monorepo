import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

const PHONE_MAX_WIDTH = 430;

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return <View style={styles.frame}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: "100%",
    maxWidth: PHONE_MAX_WIDTH,
    minHeight: "100%",
    alignSelf: "center",
    borderColor: "rgba(15, 23, 42, 0.12)",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
});
