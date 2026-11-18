"use client";

import { useSyncExternalStore } from "react";
import { redirectToAuthLogin } from "../lib/auth-client";
import { useLanguage } from "../lib/contexts/language-context";

const DISMISS_KEY = "asebili-explore-notice";

function subscribeExploreNotice(onChange: () => void) {
  window.addEventListener("asebili-explore-notice", onChange);
  return () => window.removeEventListener("asebili-explore-notice", onChange);
}

export function ExplorePromptModal() {
  const { t } = useLanguage();
  const dismissed = useSyncExternalStore(
    subscribeExploreNotice,
    () => sessionStorage.getItem(DISMISS_KEY) === "1",
    () => true,
  );

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event("asebili-explore-notice"));
  }

  if (dismissed) return null;

  return (
    <div className="explore-modal" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="explore-prompt-title"
        className="auth-panel explore-modal-panel"
      >
        <p className="eyebrow">{t("auth.exploreEyebrow")}</p>
        <h2 id="explore-prompt-title">{t("auth.exploreTitle")}</h2>
        <p className="muted">{t("auth.exploreBody")}</p>
        <div className="explore-modal-actions">
          <button className="primary-action" type="button" onClick={() => redirectToAuthLogin("/dashboard")}>
            {t("auth.hubButton")}
          </button>
          <button className="secondary-action" type="button" onClick={dismiss}>
            {t("auth.exploreContinue")}
          </button>
        </div>
      </div>
    </div>
  );
}
