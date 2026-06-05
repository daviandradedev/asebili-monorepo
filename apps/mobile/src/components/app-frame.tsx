import type { ReactNode } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";

const PHONE_MAX_WIDTH = 430;
const PHONE_MAX_HEIGHT = 920;

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const frameWidth = Math.min(width, PHONE_MAX_WIDTH);
  const frameHeight = Math.min(height, PHONE_MAX_HEIGHT);

  return (
    <View style={styles.shell}>
      <View style={[styles.phone, { width: frameWidth, height: frameHeight }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  phone: {
    flex: 1,
    maxWidth: "100%",
    maxHeight: "100%",
    borderColor: "rgba(15, 23, 42, 0.12)",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
});
