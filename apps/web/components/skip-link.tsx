"use client";

import { useLanguage } from "../lib/contexts/language-context";

export function SkipLink() {
  const { t } = useLanguage();

  return (
    <a className="skip-link" href="#main-content">
      {t("common.skipToContent")}
    </a>
  );
}
