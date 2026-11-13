import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { usePreferences } from "../contexts/preferences-context";
import { clientAuthHubUrl } from "../lib/auth-hub";
import { layout } from "../layout";
import { AsebiliLogo } from "./asebili-logo";
import { PreferencesBar } from "./preferences-bar";

const SOCIAL_LINKS = [
  {
    href: "https://linkedin.com/in/daviandradedev",
    icon: "linkedin" as const,
    label: "LinkedIn",
  },
  {
    href: "https://github.com/daviandradedev",
    icon: "github" as const,
    label: "GitHub",
  },
  {
    href: "mailto:daviandrade.dev@gmail.com",
    icon: "mail" as const,
    label: "E-mail",
  },
];

type WebShellProps = {
  children: ReactNode;
};

function showLeavingOverlay(message: string, background: string, ink: string, accent: string) {
  if (document.getElementById("student-auth-redirect")) return;
  const style = document.createElement("style");
  style.textContent =
    "@keyframes student-redirect-spin { to { transform: rotate(360deg); } }";
  const root = document.createElement("div");
  root.id = "student-auth-redirect";
  root.setAttribute("role", "status");
  root.setAttribute("aria-live", "polite");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "20";
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.alignItems = "center";
  root.style.justifyContent = "center";
  root.style.gap = "16px";
  root.style.padding = "24px";
  root.style.background = background;
  root.style.color = ink;
  const spinner = document.createElement("div");
  spinner.style.width = "44px";
  spinner.style.height = "44px";
  spinner.style.border = "3px solid transparent";
  spinner.style.borderTopColor = accent;
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "student-redirect-spin 0.7s linear infinite";
  const label = document.createElement("p");
  label.textContent = message;
  label.style.margin = "0";
  label.style.maxWidth = "24rem";
  label.style.fontSize = "18px";
  label.style.fontWeight = "800";
  label.style.textAlign = "center";
  root.append(style, spinner, label);
  document.body.append(root);
}

export function WebShell({ children }: WebShellProps) {
  const { width } = useWindowDimensions();
  const { colors, format, t } = usePreferences();
  const wide = width >= layout.webChromeBreakpoint;
  const showWordmark = width >= 520;

  if (Platform.OS !== "web") return <>{children}</>;

  function openExternal(href: string) {
    const target = href.startsWith("mailto:") ? "_self" : "_blank";
    window.open(href, target, "noopener,noreferrer");
  }

  function goToAuth() {
    showLeavingOverlay(
      t("redirect.openingAccount"),
      colors.bg,
      colors.ink,
      colors.primary,
    );
    const hub = clientAuthHubUrl();
    window.location.assign(`${hub}/continue?next=${encodeURIComponent("/account")}`);
  }

  return (
    <View style={[styles.shell, { backgroundColor: colors.bgAccent }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityLabel={t("mobile.backToAuthA11y")}
          accessibilityRole="button"
          onPress={goToAuth}
          style={({ pressed }) => [styles.authLink, pressed && styles.pressed]}
        >
          <Text style={[styles.authLinkText, { color: colors.primary }]}>
            {t("mobile.backToAuth")}
          </Text>
        </Pressable>
        <View pointerEvents="none" style={styles.brand}>
          <AsebiliLogo colors={colors} size={showWordmark ? 36 : 28} />
          {showWordmark ? (
            <Text style={[styles.brandName, { color: colors.primary }]}>
              {t("brand.name")}
            </Text>
          ) : null}
        </View>
        <PreferencesBar embedded />
      </View>
      <View style={[styles.stage, !wide && styles.stageFill]}>{children}</View>
      <View
        style={[
          styles.footer,
          wide ? styles.footerWide : styles.footerStack,
          { backgroundColor: colors.bg, borderTopColor: colors.border },
        ]}
      >
        {wide ? <View style={styles.footerSlot} /> : null}
        <Text style={[styles.footerCopy, { color: colors.muted }]}>
          {format("mobile.footerCredit", { year: new Date().getFullYear() })}
        </Text>
        <View
          accessibilityLabel={t("mobile.footerSocial")}
          accessibilityRole="list"
          style={[styles.footerLinks, wide && styles.footerLinksWide]}
        >
          {SOCIAL_LINKS.map((link) => (
            <Pressable
              accessibilityLabel={link.label}
              accessibilityRole="link"
              key={link.label}
              onPress={() => openExternal(link.href)}
              style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}
            >
              <Feather color={colors.muted} name={link.icon} size={16} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    position: "relative",
  },
  header: {
    flexShrink: 0,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  authLink: {
    zIndex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  authLinkText: {
    fontSize: 14,
    fontWeight: "800",
  },
  brand: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  pressed: {
    opacity: 0.7,
  },
  stage: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  stageFill: {
    padding: 0,
  },
  footer: {
    flexShrink: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  footerWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerStack: {
    alignItems: "center",
  },
  footerSlot: {
    flex: 1,
  },
  footerCopy: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  footerLinksWide: {
    flex: 1,
    justifyContent: "flex-end",
  },
  footerLink: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
