"use client";

import { useSyncExternalStore } from "react";
import { redirectToAuthLogin } from "../lib/auth-client";
import { useLanguage } from "../lib/contexts/language-context";

const DISMISS_KEY = "asebili-guest-notice";

function subscribeGuestNotice(onChange: () => void) {
  window.addEventListener("asebili-guest-notice", onChange);
  return () => window.removeEventListener("asebili-guest-notice", onChange);
}

export function GuestSessionModal() {
  const { t } = useLanguage();
  const dismissed = useSyncExternalStore(
    subscribeGuestNotice,
    () => sessionStorage.getItem(DISMISS_KEY) === "1",
    () => true,
  );

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event("asebili-guest-notice"));
  }

  if (dismissed) return null;

  return (
    <div className="guest-modal" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-session-title"
        className="auth-panel guest-modal-panel"
      >
        <p className="eyebrow">{t("auth.guestEyebrow")}</p>
        <h2 id="guest-session-title">{t("auth.guestTitle")}</h2>
        <p className="muted">{t("auth.guestBody")}</p>
        <div className="guest-modal-actions">
          <button className="primary-action" type="button" onClick={() => redirectToAuthLogin("/dashboard")}>
            {t("auth.hubButton")}
          </button>
          <button className="secondary-action" type="button" onClick={dismiss}>
            {t("auth.guestContinue")}
          </button>
        </div>
      </div>
    </div>
  );
}
