import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppFrame } from "../src/components/app-frame";
import { VLibrasWidget } from "../src/components/vlibras-widget";
import {
  PreferencesProvider,
  usePreferences,
} from "../src/contexts/preferences-context";
import { lightColors } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { theme } = usePreferences();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(Feather.font);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return <View style={styles.boot} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppFrame>
          <PreferencesProvider>
            <RootStack />
          </PreferencesProvider>
        </AppFrame>
      </SafeAreaProvider>
      <VLibrasWidget />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    backgroundColor: lightColors.bg,
  },
});
