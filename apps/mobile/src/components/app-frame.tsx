import type { ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { usePreferences } from "../contexts/preferences-context";
import { layout, phoneFrameSize } from "../layout";

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  const { height, width } = useWindowDimensions();
  const { colors } = usePreferences();

  if (Platform.OS !== "web") return <>{children}</>;

  const device = width >= layout.webChromeBreakpoint;
  const size = device ? phoneFrameSize(width, height) : null;

  return (
    <View
      style={[
        device ? styles.device : styles.fill,
        size,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  device: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#1B1630",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  fill: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    alignSelf: "stretch",
  },
});
