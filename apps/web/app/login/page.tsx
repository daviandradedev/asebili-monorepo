"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AsebiliLogo } from "../../components/asebili-logo";
import { AppHeader } from "../../components/app-header";
import { UsageHint } from "../../components/usage-hint";
import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../../lib/contexts/language-context";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [router, session?.user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const result = isSignUp
        ? await authClient.signUp.email({
            name: name.trim() || t("auth.defaultInstructorName"),
            email: trimmedEmail,
            password,
          })
        : await authClient.signIn.email({
            email: trimmedEmail,
            password,
          });

      if (result.error) {
        setError(result.error.message || t("auth.authFailed"));
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : t("auth.authFailed"),
      );
    } finally {
      setLoading(false);
    }
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

          <section className="auth-panel" aria-busy={isPending || loading}>
            <div className="auth-panel-header">
              <p className="eyebrow">{t("auth.instructorArea")}</p>
              <h1>
                {isSignUp ? t("auth.signUpTitle") : t("auth.signInTitle")}
              </h1>
              <p className="muted">
                {isSignUp ? t("auth.signUpSubtitle") : t("auth.signInSubtitle")}
              </p>
            </div>

            <p className="assistive-note">{t("auth.vlibrasNote")}</p>

            <div
              className="segmented-control"
              role="tablist"
              aria-label={t("auth.modeTabs")}
            >
              <button
                className={mode === "sign-in" ? "active" : ""}
                type="button"
                onClick={() => setMode("sign-in")}
                role="tab"
                aria-selected={mode === "sign-in"}
              >
                {t("auth.signIn")}
              </button>
              <button
                className={isSignUp ? "active" : ""}
                type="button"
                onClick={() => setMode("sign-up")}
                role="tab"
                aria-selected={isSignUp}
              >
                {t("auth.signUp")}
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp ? (
                <label>
                  {t("auth.name")}
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder={t("auth.namePlaceholder")}
                  />
                </label>
              ) : null}

              <label>
                {t("auth.email")}
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  required
                />
              </label>

              <label>
                {t("auth.password")}
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={8}
                  placeholder={t("auth.passwordPlaceholder")}
                  required
                />
              </label>

              {error ? (
                <p className="form-error" role="alert" aria-live="assertive">
                  {error}
                </p>
              ) : null}

              <button
                className="primary-action"
                type="submit"
                disabled={loading || isPending}
              >
                {loading
                  ? t("auth.wait")
                  : isSignUp
                    ? t("auth.startNow")
                    : t("auth.enterPanel")}
              </button>
            </form>
          </section>
        </div>
        <UsageHint className="auth-hint" />
      </div>
    </main>
  );
}
