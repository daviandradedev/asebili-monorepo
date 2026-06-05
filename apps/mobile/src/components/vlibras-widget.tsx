import { useEffect } from "react";
import { Platform } from "react-native";

const VLIBRAS_URL = "https://vlibras.gov.br/app";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (appUrl: string) => unknown;
    };
  }
}

let vlibrasStarted = false;

function ensureMarkup() {
  if (document.querySelector("[vw]")) {
    return;
  }

  const mount = document.createElement("div");
  mount.innerHTML = `<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>`;

  const widgetRoot = mount.firstElementChild;
  if (widgetRoot) {
    document.body.appendChild(widgetRoot);
  }
}

function startVLibras() {
  if (vlibrasStarted || !window.VLibras) {
    return;
  }

  new window.VLibras.Widget(VLIBRAS_URL);

  if (document.readyState === "complete" && typeof window.onload === "function") {
    window.onload.call(window, new Event("load"));
  }

  vlibrasStarted = true;
}

export function VLibrasWidget() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    ensureMarkup();

    if (window.VLibras) {
      startVLibras();
      return;
    }

    const existing = document.querySelector(
      'script[src*="vlibras-plugin"]',
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.VLibras) {
        startVLibras();
      } else {
        existing.addEventListener("load", startVLibras, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `${VLIBRAS_URL}/vlibras-plugin.js`;
    script.async = true;
    script.onload = startVLibras;
    document.body.appendChild(script);
  }, []);

  return null;
}
