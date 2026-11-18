"use client";

import { AppHeader } from "./app-header";
import { redirectToAuthLogin } from "../lib/auth-client";
import { useLanguage } from "../lib/contexts/language-context";

export function SignInRequired() {
  const { t } = useLanguage();

  return (
    <main className="auth-shell page-shell" id="main-content">
      <AppHeader />
      <div className="page-frame">
        <section className="auth-panel">
          <div className="auth-panel-header">
            <p className="eyebrow">{t("auth.instructorArea")}</p>
            <h1>{t("auth.signInRequiredTitle")}</h1>
            <p className="muted">{t("auth.signInRequiredBody")}</p>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() => redirectToAuthLogin("/dashboard")}
          >
            {t("auth.hubButton")}
          </button>
        </section>
      </div>
    </main>
  );
}
