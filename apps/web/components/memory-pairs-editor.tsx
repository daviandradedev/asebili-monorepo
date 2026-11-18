"use client";

import type { MemoryPair } from "../lib/activity-options";
import { createMemoryPair } from "../lib/activity-options";
import { useLanguage } from "../lib/contexts/language-context";

type MemoryPairsEditorProps = {
  value: MemoryPair[];
  onChange: (value: MemoryPair[]) => void;
};

export function MemoryPairsEditor({ onChange, value }: MemoryPairsEditorProps) {
  const { t } = useLanguage();

  function updatePair(index: number, next: MemoryPair) {
    onChange(value.map((pair, pairIndex) => (pairIndex === index ? next : pair)));
  }

  return (
    <div className="pairs-editor">
      <p className="pairs-editor-legend">{t("dashboard.memoryPairsLegend")}</p>
      {value.map((pair, index) => (
        <article className="pairs-editor-row" key={pair.id}>
          <h3>
            {t("dashboard.memoryPair")} {index + 1}
          </h3>
          <label>
            {t("dashboard.memoryTerm")}
            <input
              value={pair.term}
              onChange={(event) =>
                updatePair(index, { ...pair, term: event.target.value })
              }
              required
            />
          </label>
          <label>
            {t("dashboard.memorySign")}
            <input
              value={pair.sign}
              onChange={(event) =>
                updatePair(index, { ...pair, sign: event.target.value })
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
        onClick={() => onChange([...value, createMemoryPair()])}
      >
        {t("dashboard.memoryAddPair")}
      </button>
    </div>
  );
}
