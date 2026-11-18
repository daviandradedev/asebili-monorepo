"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/contexts/language-context";

const STORAGE_KEY = "asebili-usage-hint-dismissed";

const HINT_STEPS = [
  "account",
  "class",
  "activity",
  "share",
  "student",
  "results",
] as const;

type UsageHintProps = {
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function UsageHint({ className }: UsageHintProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      return;
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <section
      className={classNames("usage-hint", className)}
      role="note"
      aria-labelledby="usage-hint-title"
    >
      <div className="usage-hint-alert">
        <div className="usage-hint-head">
          <div className="usage-hint-copy">
            <p className="usage-hint-eyebrow">{t("guide.eyebrow")}</p>
            <h2 id="usage-hint-title">{t("guide.title")}</h2>
            <p className="usage-hint-body">{t("guide.body")}</p>
          </div>
          <button
            type="button"
            className="usage-hint-close"
            onClick={dismiss}
            aria-label={t("guide.close")}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <ol className="usage-hint-steps">
          {HINT_STEPS.map((step, index) => (
            <li className="usage-hint-step" key={step}>
              <span className="usage-hint-step-number" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <strong>{t(`guide.steps.${step}.title`)}</strong>
                <p>{t(`guide.steps.${step}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
