import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export async function notify(
  type: Haptics.NotificationFeedbackType,
): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(type);
}
