import { StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { usePreferences } from "../contexts/preferences-context";
import { radii } from "../theme";

type LibrasVideoProps = {
  sourceUrl: string | null;
};

export function LibrasVideo({ sourceUrl }: LibrasVideoProps) {
  const { colors, t } = usePreferences();

  if (!sourceUrl) {
    return (
      <View
        style={[
          styles.fallback,
          {
            borderColor: colors.borderStrong,
            backgroundColor: colors.bgAccent,
          },
        ]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={t("mobile.librasA11y")}
      >
        <View style={[styles.fallbackMark, { backgroundColor: colors.primary }]}>
          <Text style={styles.fallbackSymbol}>📺</Text>
        </View>
        <Text style={[styles.fallbackText, { color: colors.muted }]}>
          {t("mobile.librasUnavailable")}
        </Text>
      </View>
    );
  }

  return <LibrasVideoPlayer sourceUrl={sourceUrl} />;
}

function LibrasVideoPlayer({ sourceUrl }: { sourceUrl: string }) {
  const { colors, t } = usePreferences();
  const player = useVideoPlayer({ uri: sourceUrl }, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
  });

  return (
    <View
      style={[styles.container, { borderColor: colors.primary }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t("mobile.videoA11y")}
    >
      <View style={[styles.videoBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.videoBadgeText}>{t("mobile.librasBadge")}</Text>
      </View>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 3,
    backgroundColor: "#000000",
  },
  videoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  videoBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  fallback: {
    alignItems: "center",
    gap: 6,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: 2,
    padding: 24,
  },
  fallbackMark: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fallbackSymbol: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  fallbackText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
