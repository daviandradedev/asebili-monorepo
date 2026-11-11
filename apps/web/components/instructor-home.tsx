"use client";

import { AsebiliLogo } from "./asebili-logo";
import { AppHeader } from "./app-header";
import { UsageHint } from "./usage-hint";
import { authClient, redirectToAuthLogin } from "../lib/auth-client";
import { useLanguage } from "../lib/contexts/language-context";

export function InstructorHome() {
  const { t } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  function openAccount() {
    if (session) {
      window.location.assign("/dashboard");
      return;
    }
    redirectToAuthLogin("/dashboard");
  }

  return (
    <main className="auth-shell page-shell" id="main-content">
      <AppHeader />
      <div className="page-frame">
        <div className="auth-layout">
          <aside className="auth-hero" aria-label={t("auth.about")}>
            <div className="brand-mark">
              <AsebiliLogo className="brand-logo" size={56} />
              <div>
                <p className="brand-name">{t("brand.name")}</p>
                <p className="brand-tagline">{t("brand.tagline")}</p>
              </div>
            </div>

            <h1>
              {t("auth.heroTitle")} <span>{t("auth.heroHighlight")}</span>
            </h1>
            <p className="muted">{t("auth.heroBody")}</p>

            <ul className="feature-chips">
              <li className="feature-chip">
                <span className="feature-chip-dot" aria-hidden="true" />
                {t("auth.chipGamified")}
              </li>
              <li className="feature-chip">
                <span className="feature-chip-dot" aria-hidden="true" />
                {t("auth.chipLibras")}
              </li>
              <li className="feature-chip">
                <span className="feature-chip-dot" aria-hidden="true" />
                {t("auth.chipMobile")}
              </li>
            </ul>
          </aside>

          <section className="auth-panel">
            <div className="auth-panel-header">
              <p className="eyebrow">{t("auth.instructorArea")}</p>
              <h1>{t("auth.signInTitle")}</h1>
              <p className="muted">{session ? t("auth.signedInBody") : t("auth.signInSubtitle")}</p>
            </div>

            <p className="assistive-note">{t("auth.vlibrasNote")}</p>

            <button className="primary-action" type="button" disabled={isPending} onClick={openAccount}>
              {session ? t("auth.openDashboard") : t("auth.hubButton")}
            </button>
          </section>
        </div>
        <UsageHint className="auth-hint" />
      </div>
    </main>
  );
}
