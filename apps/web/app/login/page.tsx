"use client";

import { AsebiliLogo } from "../../components/asebili-logo";
import { AppHeader } from "../../components/app-header";
import { UsageHint } from "../../components/usage-hint";
import { redirectToAuthLogin } from "../../lib/auth-client";
import { useLanguage } from "../../lib/contexts/language-context";

export default function LoginPage() {
  const { t } = useLanguage();

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
              <p className="muted">{t("auth.signInSubtitle")}</p>
            </div>

            <p className="assistive-note">{t("auth.vlibrasNote")}</p>

            <button
              className="primary-action"
              type="button"
              onClick={() => redirectToAuthLogin("/dashboard")}
            >
              {t("auth.hubButton")}
            </button>
          </section>
        </div>
        <UsageHint className="auth-hint" />
      </div>
    </main>
  );
}
