"use client";

import type { MatchingPair } from "../lib/activity-options";
import { createMatchingPair } from "../lib/activity-options";
import { useLanguage } from "../lib/contexts/language-context";

type MatchingPairsEditorProps = {
  value: MatchingPair[];
  onChange: (value: MatchingPair[]) => void;
};

export function MatchingPairsEditor({
  onChange,
  value,
}: MatchingPairsEditorProps) {
  const { t } = useLanguage();

  function updatePair(index: number, next: MatchingPair) {
    onChange(value.map((pair, pairIndex) => (pairIndex === index ? next : pair)));
  }

  return (
    <div className="pairs-editor">
      <p className="pairs-editor-legend">{t("dashboard.matchingPairsLegend")}</p>
      {value.map((pair, index) => (
        <article className="pairs-editor-row" key={pair.id}>
          <h3>
            {t("dashboard.matchingPair")} {index + 1}
          </h3>
          <label>
            {t("dashboard.matchingLeft")}
            <input
              value={pair.left}
              onChange={(event) =>
                updatePair(index, { ...pair, left: event.target.value })
              }
              required
            />
          </label>
          <label>
            {t("dashboard.matchingRight")}
            <input
              value={pair.right}
              onChange={(event) =>
                updatePair(index, { ...pair, right: event.target.value })
              }
              required
            />
          </label>
          {value.length > 1 ? (
            <button
              type="button"
              className="secondary-action pairs-editor-remove"
              onClick={() =>
                onChange(value.filter((_, pairIndex) => pairIndex !== index))
              }
            >
              {t("dashboard.quizRemoveQuestion")}
            </button>
          ) : null}
        </article>
      ))}
      <button
        type="button"
        className="secondary-action"
        onClick={() => onChange([...value, createMatchingPair()])}
      >
        {t("dashboard.matchingAddPair")}
      </button>
    </div>
  );
}
