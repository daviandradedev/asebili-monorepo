"use client";

import { useEffect } from "react";

const VLIBRAS_APP_URL = "https://vlibras.gov.br/app";
const VLIBRAS_SCRIPT_ID = "asebili-vlibras-plugin";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (appUrl: string) => unknown;
    };
    __asebiliVLibrasReady?: boolean;
  }
}

export default function VLibrasWidget() {
  useEffect(() => {
    const initWidget = () => {
      if (!window.VLibras || window.__asebiliVLibrasReady) {
        return;
      }

      new window.VLibras.Widget(VLIBRAS_APP_URL);
      window.__asebiliVLibrasReady = true;
    };

    const currentScript = document.getElementById(
      VLIBRAS_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (currentScript) {
      initWidget();
      currentScript.addEventListener("load", initWidget, { once: true });

      return () => currentScript.removeEventListener("load", initWidget);
    }

    const script = document.createElement("script");
    script.id = VLIBRAS_SCRIPT_ID;
    script.src = `${VLIBRAS_APP_URL}/vlibras-plugin.js`;
    script.async = true;
    script.addEventListener("load", initWidget, { once: true });

    document.body.appendChild(script);

    return () => script.removeEventListener("load", initWidget);
  }, []);

  return (
    <div {...{ vw: "" }} className="enabled" aria-hidden="true">
      <div {...{ "vw-access-button": "" }} className="active" />
      <div {...{ "vw-plugin-wrapper": "" }}>
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
}
