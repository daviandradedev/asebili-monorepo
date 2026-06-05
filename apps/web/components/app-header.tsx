"use client";

import { AsebiliLogo } from "./asebili-logo";
import { AccessibilityToolbar } from "./accessibility-toolbar";
import { PreferencesBar } from "./preferences-bar";
import { useLanguage } from "../lib/contexts/language-context";

type AppHeaderProps = {
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppHeader({ className }: AppHeaderProps) {
  const { t } = useLanguage();

  return (
    <header
      className={classNames("app-header", className)}
      aria-label={t("appHeader.label")}
    >
      <div className="app-header-inner">
        <div className="app-header-start">
          <AccessibilityToolbar className="app-header-a11y" />
        </div>
        <div className="app-header-center">
          <div className="app-header-brand">
            <AsebiliLogo className="app-header-logo" size={44} decorative />
            <p className="brand-name app-header-brand-name">{t("brand.name")}</p>
          </div>
        </div>
        <div className="app-header-end">
          <PreferencesBar />
        </div>
      </div>
    </header>
  );
}
