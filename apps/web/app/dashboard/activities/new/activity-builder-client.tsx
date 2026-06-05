"use client";

import {
  buildColorsColorToWordQuiz,
  buildColorsSignToColorQuiz,
  buildFamilySignToWordQuiz,
  createDefaultQuizOptions,
  parseQuizOptions,
  quizToJson,
  type DashboardActivity,
  type DashboardClass,
  type Json,
} from "@asebili/database";
import {
  formatMessage,
  localizeActivityTitle,
  localizeClassName,
} from "@asebili/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  createDefaultMatchingPairs,
  createDefaultMemoryPairs,
  matchingPairsFromJson,
  matchingToJson,
  memoryPairsFromJson,
  memoryToJson,
  validateMatchingPairs,
  validateMemoryPairs,
} from "../../../../lib/activity-options";
import { authClient } from "../../../../lib/auth-client";
import { useLanguage } from "../../../../lib/contexts/language-context";
import {
  DEFAULT_SAMPLE_VIDEO_URL,
  SAMPLE_LIBRAS_VIDEOS,
} from "../../../../lib/sample-videos";
import { AppHeader } from "../../../../components/app-header";
import { LibrasVideoField } from "../../../../components/libras-video-field";
import { MatchingPairsEditor } from "../../../../components/matching-pairs-editor";
import { MemoryPairsEditor } from "../../../../components/memory-pairs-editor";
import { QuizQuestionEditor } from "../../../../components/quiz-question-editor";

type ActivityBuilderClientProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  initialClasses: DashboardClass[];
  initialActivity?: DashboardActivity;
};

type ApiError = {
  error?: string;
};

const templateKeys = ["quiz", "memory", "matching"] as const;
type TemplateKey = (typeof templateKeys)[number];

const starterKeys = [
  "colors-sign",
  "colors-word",
  "family",
  "memory",
  "matching",
] as const;
type StarterKey = (typeof starterKeys)[number];

const DEFAULT_TEMPLATE_TYPE = "quiz" satisfies TemplateKey;
const CLASS_CACHE_KEY = "asebili-dashboard-classes";

const STARTER_TEMPLATE_TYPES: Record<StarterKey, TemplateKey> = {
  "colors-sign": "quiz",
  "colors-word": "quiz",
  family: "quiz",
  memory: "memory",
  matching: "matching",
};

const STARTER_VIDEO_IDS: Record<StarterKey, string> = {
  "colors-sign": "libras-cachorro",
  "colors-word": "cores-azul",
  family: "familia-sinal",
  memory: "familia-irmaos",
  matching: "cores-verde",
};

function isTemplateKey(templateType: string): templateType is TemplateKey {
  return templateKeys.includes(templateType as TemplateKey);
}

function initialTemplateType(activity?: DashboardActivity): TemplateKey {
  if (activity && isTemplateKey(activity.templateType)) {
    return activity.templateType;
  }
  return DEFAULT_TEMPLATE_TYPE;
}

function initialQuizOptions(activity?: DashboardActivity) {
  if (activity?.templateType === "quiz") {
    return parseQuizOptions(activity.jsonOptions) ?? createDefaultQuizOptions();
  }
  return createDefaultQuizOptions();
}

function initialMemoryPairs(activity?: DashboardActivity) {
  if (activity?.templateType === "memory") {
    return (
      memoryPairsFromJson(activity.jsonOptions) ?? createDefaultMemoryPairs()
    );
  }
  return createDefaultMemoryPairs();
}

function initialMatchingPairs(activity?: DashboardActivity) {
  if (activity?.templateType === "matching") {
    return (
      matchingPairsFromJson(activity.jsonOptions) ?? createDefaultMatchingPairs()
    );
  }
  return createDefaultMatchingPairs();
}

function templateBadgeClass(templateType: string) {
  if (isTemplateKey(templateType)) {
    return `badge badge--${templateType}`;
  }
  return "badge badge--default";
}

function userInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function starterVideoUrl(key: StarterKey) {
  return (
    SAMPLE_LIBRAS_VIDEOS.find((video) => video.id === STARTER_VIDEO_IDS[key])
      ?.url ?? DEFAULT_SAMPLE_VIDEO_URL
  );
}

function readCachedClasses() {
  try {
    const cached = sessionStorage.getItem(CLASS_CACHE_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as DashboardClass[]) : [];
  } catch {
    return [];
  }
}

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage);
  }

  return payload;
}

export default function ActivityBuilderClient({
  user,
  initialClasses,
  initialActivity,
}: ActivityBuilderClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEditMode = Boolean(initialActivity);
  const [activityTitle, setActivityTitle] = useState(
    initialActivity?.title ?? "",
  );
  const [templateType, setTemplateType] = useState<TemplateKey>(
    initialTemplateType(initialActivity),
  );
  const [librasVideoUrl, setLibrasVideoUrl] = useState<string>(
    initialActivity?.librasVideoUrl?.trim() || DEFAULT_SAMPLE_VIDEO_URL,
  );
  const [classes, setClasses] = useState<DashboardClass[]>(initialClasses);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    initialActivity?.classIds.length
      ? [...initialActivity.classIds]
      : initialClasses[0]
        ? [initialClasses[0].id]
        : [],
  );
  const [quizOptions, setQuizOptions] = useState(() =>
    initialQuizOptions(initialActivity),
  );
  const [memoryPairs, setMemoryPairs] = useState(() =>
    initialMemoryPairs(initialActivity),
  );
  const [matchingPairs, setMatchingPairs] = useState(() =>
    initialMatchingPairs(initialActivity),
  );
  const [publishingActivity, setPublishingActivity] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = userInitials(user.name, user.email);

  useEffect(() => {
    const cachedClasses = readCachedClasses();
    if (cachedClasses.length > 0) {
      setClasses(cachedClasses);
      setSelectedClassIds((current) =>
        current.length > 0 ? current : cachedClasses[0] ? [cachedClasses[0].id] : [],
      );
    }

    let cancelled = false;

    fetch("/api/classes")
      .then((response) =>
        parseResponse<{ classes: DashboardClass[] }>(
          response,
          t("dashboard.loadFailed"),
        ),
      )
      .then((payload) => {
        if (cancelled) return;
        setClasses(payload.classes);
        setSelectedClassIds((current) =>
          current.length > 0
            ? current
            : payload.classes[0]
              ? [payload.classes[0].id]
              : [],
        );
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : t("dashboard.loadFailed"),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  function templateLabel(template: string) {
    const key = `dashboard.templates.${template}`;
    const label = t(key);
    return label === key ? template : label;
  }

  function starterTitle(key: StarterKey) {
    return t(`dashboard.starters.${key}.title`);
  }

  function starterBody(key: StarterKey) {
    return t(`dashboard.starters.${key}.body`);
  }

  function applyStarterTemplate(key: StarterKey) {
    const nextTemplateType = STARTER_TEMPLATE_TYPES[key];
    setTemplateType(nextTemplateType);
    setActivityTitle(starterTitle(key));
    setLibrasVideoUrl(starterVideoUrl(key));
    setError("");

    if (selectedClassIds.length === 0 && classes[0]) {
      setSelectedClassIds([classes[0].id]);
    }

    if (key === "colors-sign") {
      setQuizOptions(buildColorsSignToColorQuiz());
    } else if (key === "colors-word") {
      setQuizOptions(buildColorsColorToWordQuiz());
    } else if (key === "family") {
      setQuizOptions(buildFamilySignToWordQuiz());
    } else if (key === "memory") {
      setMemoryPairs([
        { id: "mem-demo-1", term: "gato", sign: "mãos simulando bigodes" },
        { id: "mem-demo-2", term: "cachorro", sign: "batida na coxa" },
        { id: "mem-demo-3", term: "pássaro", sign: "bico com os dedos" },
      ]);
    } else {
      setMatchingPairs([
        { id: "match-demo-1", left: "1", right: "um" },
        { id: "match-demo-2", left: "2", right: "dois" },
        { id: "match-demo-3", left: "3", right: "três" },
        { id: "match-demo-4", left: "4", right: "quatro" },
      ]);
    }

    setSuccess(
      formatMessage(t("dashboard.templateApplied"), {
        template: starterTitle(key),
      }),
    );
  }

  function toggleClassSelection(classId: string) {
    setSelectedClassIds((current) =>
      current.includes(classId)
        ? current.filter((id) => id !== classId)
        : [...current, classId],
    );
  }

  function handleTemplateTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextTemplateType = event.target.value;
    if (isTemplateKey(nextTemplateType)) {
      setTemplateType(nextTemplateType);
    }
  }

  async function handleCreateActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    let parsedOptions: Json;
    if (templateType === "quiz") {
      parsedOptions = quizToJson(quizOptions);
    } else if (templateType === "memory") {
      const validationError = validateMemoryPairs(memoryPairs, language);
      if (validationError) {
        setError(validationError);
        return;
      }
      parsedOptions = memoryToJson(memoryPairs);
    } else {
      const validationError = validateMatchingPairs(matchingPairs, language);
      if (validationError) {
        setError(validationError);
        return;
      }
      parsedOptions = matchingToJson(matchingPairs);
    }

    if (!librasVideoUrl.trim()) {
      setError(t("dashboard.videoRequired"));
      return;
    }

    setPublishingActivity(true);

    try {
      const endpoint = isEditMode
        ? `/api/activities/${initialActivity?.id}`
        : "/api/activities";
      const method = isEditMode ? "PATCH" : "POST";
      const fallbackMessage = isEditMode
        ? t("dashboard.updateActivityFailed")
        : t("dashboard.createActivityFailed");

      const payload = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activityTitle,
          templateType,
          librasVideoUrl,
          jsonOptions: parsedOptions,
          classIds: selectedClassIds,
        }),
      }).then((response) =>
        parseResponse<{ activity: DashboardActivity }>(
          response,
          fallbackMessage,
        ),
      );

      if (isEditMode) {
        setSuccess(
          formatMessage(t("dashboard.activityUpdated"), {
            title: localizeActivityTitle(payload.activity.title, language),
          }),
        );
      } else {
        setActivityTitle("");
        setLibrasVideoUrl(DEFAULT_SAMPLE_VIDEO_URL);
        setQuizOptions(createDefaultQuizOptions());
        setMemoryPairs(createDefaultMemoryPairs());
        setMatchingPairs(createDefaultMatchingPairs());
        setSuccess(
          formatMessage(t("dashboard.activityCreated"), {
            title: localizeActivityTitle(payload.activity.title, language),
          }),
        );
      }
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : t("dashboard.createActivityFailed"),
      );
    } finally {
      setPublishingActivity(false);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="dashboard-shell page-shell" id="main-content">
      <AppHeader />
      <div className="page-frame dashboard-frame activity-builder-page">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <p className="eyebrow">{t("dashboard.builderPageEyebrow")}</p>
            <h1>
              {isEditMode
                ? t("dashboard.editBuilderPageTitle")
                : t("dashboard.builderPageTitle")}
            </h1>
            <p className="muted">
              {isEditMode
                ? t("dashboard.editBuilderPageSubtitle")
                : t("dashboard.builderPageSubtitle")}
            </p>
          </div>

          <div className="header-actions">
            <Link className="secondary-action" href="/dashboard">
              {t("dashboard.backToDashboard")}
            </Link>
            <div className="user-pill">
              <span className="user-avatar" aria-hidden="true">
                {initials}
              </span>
              <span title={user.name || user.email}>
                {user.name || user.email}
              </span>
            </div>
            <button
              className="secondary-action"
              type="button"
              onClick={handleSignOut}
            >
              {t("dashboard.signOut")}
            </button>
          </div>
        </header>

        {error ? (
          <p className="page-error" role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}

        {success ? (
          <div className="page-success builder-success" role="status">
            <span>{success}</span>
            <Link href="/dashboard">{t("dashboard.viewDashboard")}</Link>
          </div>
        ) : null}

        <form
          className="workspace-panel activity-builder-panel"
          onSubmit={handleCreateActivity}
        >
          <div className="panel-head">
            <span className="panel-icon" aria-hidden="true">
              01
            </span>
            <h2>{t("dashboard.builderTitle")}</h2>
            <p className="muted">{t("dashboard.builderBody")}</p>
          </div>

          {!isEditMode ? (
            <details className="builder-section builder-accordion" open>
              <summary className="builder-section-head">
                <span>{t("dashboard.builderStepTemplate")}</span>
                <strong>{t("dashboard.templateLibraryTitle")}</strong>
              </summary>
              <div className="starter-template-grid">
                {starterKeys.map((key) => (
                  <button
                    className={
                      STARTER_TEMPLATE_TYPES[key] === templateType
                        ? "starter-template active"
                        : "starter-template"
                    }
                    key={key}
                    type="button"
                    onClick={() => applyStarterTemplate(key)}
                  >
                    <span
                      className={templateBadgeClass(
                        STARTER_TEMPLATE_TYPES[key],
                      )}
                    >
                      {templateLabel(STARTER_TEMPLATE_TYPES[key])}
                    </span>
                    <strong>{starterTitle(key)}</strong>
                    <span>{starterBody(key)}</span>
                  </button>
                ))}
              </div>
            </details>
          ) : null}

          <details className="builder-section builder-accordion" open>
            <summary className="builder-section-head">
              <span>{t("dashboard.builderStepSetup")}</span>
              <strong>{t("dashboard.activityDetails")}</strong>
            </summary>
            <div className="builder-form-grid">
              <label>
                {t("dashboard.activityTitle")}
                <input
                  value={activityTitle}
                  onChange={(event) => setActivityTitle(event.target.value)}
                  autoComplete="off"
                  placeholder={t("dashboard.activityTitlePlaceholder")}
                  required
                />
              </label>
              <label>
                {t("dashboard.activityType")}
                <select
                  value={templateType}
                  onChange={handleTemplateTypeChange}
                >
                  {templateKeys.map((key) => (
                    <option key={key} value={key}>
                      {templateLabel(key)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="builder-class-field">
                <span>{t("dashboard.activityClasses")}</span>
                <span className="builder-class-field-hint">
                  {t("dashboard.activityClassesHint")}
                </span>
                {classes.length === 0 ? (
                  <span className="builder-class-empty">
                    {t("dashboard.emptyClasses")}
                  </span>
                ) : (
                  <div
                    aria-label={t("dashboard.activityClasses")}
                    className="builder-class-checklist"
                    role="group"
                  >
                    {classes.map((item) => (
                      <label className="builder-class-check" key={item.id}>
                        <input
                          checked={selectedClassIds.includes(item.id)}
                          type="checkbox"
                          onChange={() => toggleClassSelection(item.id)}
                        />
                        <span className="builder-class-check-text">
                          {localizeClassName(item.name, language)}
                          <span className="builder-class-code">
                            {item.accessCode}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </details>

          <details className="builder-section builder-accordion">
            <summary className="builder-section-head">
              <span>{t("dashboard.builderStepVideo")}</span>
              <strong>{t("dashboard.videoLibraryTitle")}</strong>
            </summary>
            <LibrasVideoField
              value={librasVideoUrl}
              onChange={setLibrasVideoUrl}
            />
          </details>

          <details className="builder-section builder-accordion">
            <summary className="builder-section-head">
              <span>{t("dashboard.builderStepContent")}</span>
              <strong>{t("dashboard.contentEditorTitle")}</strong>
            </summary>
            {templateType === "quiz" ? (
              <QuizQuestionEditor
                value={quizOptions}
                onChange={setQuizOptions}
              />
            ) : null}
            {templateType === "memory" ? (
              <MemoryPairsEditor
                value={memoryPairs}
                onChange={setMemoryPairs}
              />
            ) : null}
            {templateType === "matching" ? (
              <MatchingPairsEditor
                value={matchingPairs}
                onChange={setMatchingPairs}
              />
            ) : null}
          </details>

          <div className="builder-submit-row">
            <Link className="secondary-action" href="/dashboard">
              {t("dashboard.backToDashboard")}
            </Link>
            <button
              className="primary-action publish-action"
              type="submit"
              disabled={publishingActivity}
            >
              {publishingActivity
                ? t("dashboard.publishing")
                : isEditMode
                  ? t("dashboard.saveActivity")
                  : t("dashboard.publishActivity")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
