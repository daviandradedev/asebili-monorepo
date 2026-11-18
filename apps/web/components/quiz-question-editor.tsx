"use client";

import {
  COLOR_CONCEPTS,
  createEmptyQuizQuestion,
  createNewQuizQuestionId,
  type QuizActivityOptions,
  type QuizOption,
  type QuizQuestion,
} from "@asebili/database";
import { useLanguage } from "../lib/contexts/language-context";
import {
  findStimulusColorPresetId,
  getStimulusColorPreset,
} from "../lib/quiz-stimulus-color";

type QuizQuestionEditorProps = {
  value: QuizActivityOptions;
  onChange: (value: QuizActivityOptions) => void;
};

const COLOR_PRESETS = Object.values(COLOR_CONCEPTS);

export function QuizQuestionEditor({ onChange, value }: QuizQuestionEditorProps) {
  const { t } = useLanguage();

  function updateQuestion(index: number, next: QuizQuestion) {
    onChange({
      questions: value.questions.map((question, questionIndex) =>
        questionIndex === index ? next : question,
      ),
    });
  }

  function addQuestion() {
    const nextId = createNewQuizQuestionId(
      value.questions.map((question) => question.id),
    );
    onChange({
      questions: [...value.questions, createEmptyQuizQuestion(nextId)],
    });
  }

  function removeQuestion(index: number) {
    if (value.questions.length <= 1) return;
    onChange({
      questions: value.questions.filter((_, questionIndex) => questionIndex !== index),
    });
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    patch: Partial<QuizOption>,
  ) {
    const question = value.questions[questionIndex];
    const current = question?.options[optionIndex];
    if (!question || !current) return;

    updateQuestion(questionIndex, {
      ...question,
      options: question.options.map((option, currentIndex) =>
        currentIndex === optionIndex ? { ...option, ...patch } : option,
      ),
    });
  }

  function applyStimulusColor(questionIndex: number, conceptId: string) {
    const concept = getStimulusColorPreset(conceptId);
    const question = value.questions[questionIndex];
    if (!concept || !question) return;

    const next: QuizQuestion = {
      ...question,
      promptColor: concept.color,
      promptVideoUrl: concept.signVideoUrl,
      promptImageUrl: concept.imageUrl,
      promptLabel: concept.label,
    };
    delete next.promptSymbol;
    updateQuestion(questionIndex, next);
  }

  return (
    <div className="quiz-editor">
      <p className="quiz-editor-hint">{t("dashboard.quizVisualHint")}</p>

      {value.questions.map((question, questionIndex) => (
        <article className="quiz-editor-question" key={question.id}>
          <div className="quiz-editor-question-head">
            <h3>
              {t("dashboard.quizQuestion")} {questionIndex + 1}
            </h3>
            {value.questions.length > 1 ? (
              <button
                type="button"
                className="secondary-action quiz-editor-remove"
                onClick={() => removeQuestion(questionIndex)}
              >
                {t("dashboard.quizRemoveQuestion")}
              </button>
            ) : null}
          </div>

          <div className="quiz-editor-visual-row">
            <label>
              {t("dashboard.quizPromptMode")}
              <select
                value={question.promptMode ?? "sign-pick"}
                onChange={(event) =>
                  updateQuestion(questionIndex, {
                    ...question,
                    promptMode: event.target.value as QuizQuestion["promptMode"],
                  })
                }
              >
                <option value="sign-pick">{t("dashboard.quizModeSignPick")}</option>
                <option value="color-pick">{t("dashboard.quizModeColorPick")}</option>
              </select>
            </label>
            <label className="quiz-editor-stimulus-color">
              {t("dashboard.quizPromptColor")}
              <div className="quiz-editor-stimulus-color-row">
                <span
                  aria-hidden="true"
                  className="quiz-color-swatch"
                  style={{
                    backgroundColor: question.promptColor ?? "#E53935",
                  }}
                />
                <select
                  value={findStimulusColorPresetId(question.promptColor)}
                  onChange={(event) => {
                    if (event.target.value) {
                      applyStimulusColor(questionIndex, event.target.value);
                    }
                  }}
                >
                  <option value="">{t("dashboard.quizPromptColorNone")}</option>
                  {COLOR_PRESETS.map((concept) => (
                    <option key={concept.id} value={concept.id}>
                      {concept.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="quiz-editor-stimulus-block">
            <p className="quiz-editor-block-title">
              {t("dashboard.quizStimulusTitle")}
            </p>
            <label>
              {t("dashboard.quizPromptVideo")}
              <input
                value={question.promptVideoUrl ?? ""}
                onChange={(event) =>
                  updateQuestion(questionIndex, {
                    ...question,
                    promptVideoUrl: event.target.value,
                  })
                }
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="quiz-editor-answers-block">
            <div className="quiz-editor-answers-head">
              <p className="quiz-editor-block-title">
                {t("dashboard.quizOptionsLegend")}
              </p>
              <p className="quiz-editor-answers-hint">
                {t("dashboard.quizOptionsHint")}
              </p>
            </div>

            <div
              className="quiz-editor-answers-grid"
              role="radiogroup"
              aria-label={t("dashboard.quizOptionsLegend")}
            >
              {question.options.map((option, optionIndex) => {
                const isCorrect = question.correctOptionId === option.id;

                return (
                  <div
                    className={
                      isCorrect
                        ? "quiz-editor-answer-cell is-correct"
                        : "quiz-editor-answer-cell"
                    }
                    key={option.id}
                  >
                    <label className="quiz-editor-answer-correct">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={isCorrect}
                        onChange={() =>
                          updateQuestion(questionIndex, {
                            ...question,
                            correctOptionId: option.id,
                          })
                        }
                      />
                      <span className="quiz-editor-answer-letter">
                        {option.id.toUpperCase()}
                      </span>
                      {isCorrect ? (
                        <span className="quiz-editor-answer-badge">
                          {t("dashboard.quizCorrectBadge")}
                        </span>
                      ) : null}
                    </label>

                    <input
                      aria-label={`${t("dashboard.quizOption")} ${optionIndex + 1}`}
                      className="quiz-editor-answer-input"
                      value={option.label ?? option.text ?? ""}
                      onChange={(event) =>
                        updateOption(questionIndex, optionIndex, {
                          label: event.target.value,
                          text: event.target.value,
                        })
                      }
                      placeholder={t("dashboard.quizOptionLabelPlaceholder")}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      ))}

      <button type="button" className="secondary-action" onClick={addQuestion}>
        {t("dashboard.quizAddQuestion")}
      </button>
    </div>
  );
}
