"use client";

import { Contrast, Minus, Plus, RotateCcw } from "lucide-react";
import { useAccessibility } from "../lib/contexts/accessibility-context";
import { useLanguage } from "../lib/contexts/language-context";

type AccessibilityToolbarProps = {
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AccessibilityToolbar({ className }: AccessibilityToolbarProps) {
  const { t } = useLanguage();
  const {
    canDecreaseFont,
    canIncreaseFont,
    decreaseFont,
    highContrast,
    increaseFont,
    resetFont,
    toggleContrast,
  } = useAccessibility();

  return (
    <div
      className={classNames("accessibility-toolbar", className)}
      role="group"
      aria-label={t("accessibility.group")}
    >
      <button
        type="button"
        className="accessibility-button"
        onClick={decreaseFont}
        disabled={!canDecreaseFont}
        title={t("accessibility.decreaseFont")}
        aria-label={t("accessibility.decreaseFont")}
      >
        <Minus size={15} aria-hidden="true" />
        <span aria-hidden="true">A</span>
      </button>
      <button
        type="button"
        className="accessibility-button"
        onClick={increaseFont}
        disabled={!canIncreaseFont}
        title={t("accessibility.increaseFont")}
        aria-label={t("accessibility.increaseFont")}
      >
        <Plus size={15} aria-hidden="true" />
        <span aria-hidden="true">A</span>
      </button>
      <button
        type="button"
        className="accessibility-button"
        onClick={resetFont}
        title={t("accessibility.resetFont")}
        aria-label={t("accessibility.resetFont")}
      >
        <RotateCcw size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="accessibility-button"
        onClick={toggleContrast}
        role="switch"
        aria-checked={highContrast}
        title={t("accessibility.highContrast")}
        aria-label={t("accessibility.highContrast")}
      >
        <Contrast size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
