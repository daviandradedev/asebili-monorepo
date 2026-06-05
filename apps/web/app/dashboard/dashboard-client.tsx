"use client";

import {
  demoColorsActivityTitle,
  formatMessage,
  localizeActivityTitle,
  localizeClassName,
} from "@asebili/i18n";
import type {
  DashboardActivity,
  DashboardClass,
  DashboardPerformanceLog,
} from "@asebili/database";
import {
  ArrowRight,
  BarChart3,
  Clipboard,
  Copy,
  PlusCircle,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "../../components/app-header";
import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../../lib/contexts/language-context";

type DashboardClientProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  studentAppUrl?: string;
  initialActivities: DashboardActivity[];
  initialClasses: DashboardClass[];
  initialLogs: DashboardPerformanceLog[];
};

type ApiError = {
  error?: string;
};

const templateKeys = ["quiz", "memory", "matching"] as const;
type TemplateKey = (typeof templateKeys)[number];

const REVIEW_STEPS = [
  "classCode",
  "videoQuiz",
  "studentSubmit",
  "evidence",
] as const;
const READINESS_ITEMS = ["bilingual", "mobile", "videos", "analytics"] as const;
const GUIDE_STEPS = [
  "account",
  "class",
  "activity",
  "share",
  "student",
  "results",
] as const;
const CLASS_CACHE_KEY = "asebili-dashboard-classes";

function isTemplateKey(templateType: string): templateType is TemplateKey {
  return templateKeys.includes(templateType as TemplateKey);
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

function isMobileReadyActivity(activity: DashboardActivity) {
  return (
    activity.templateType === "quiz" &&
    (activity.quizQuestions?.length ?? 0) > 0
  );
}

async function parseResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage);
  }

  return payload;
}

export default function DashboardClient({
  user,
  studentAppUrl = "",
  initialActivities,
  initialClasses,
  initialLogs,
}: DashboardClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const dateLocale = language === "pt" ? "pt-BR" : "en-US";
  const [classes, setClasses] = useState<DashboardClass[]>(initialClasses);
  const [activities, setActivities] =
    useState<DashboardActivity[]>(initialActivities);
  const [logs] = useState<DashboardPerformanceLog[]>(initialLogs);
  const [className, setClassName] = useState("");
  const [savingClass, setSavingClass] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState("");
  const [updatingClassId, setUpdatingClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const classById = useMemo(
    () => new Map(classes.map((item) => [item.id, item])),
    [classes],
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(dateLocale),
    [dateLocale],
  );
  const featuredClass = classes[0];
  const demoActivityName = demoColorsActivityTitle(language);
  const mobileReadyActivities = activities.filter(isMobileReadyActivity);
  const latestLog = logs[0];
  const averageScore = useMemo(() => {
    const scoredLogs = logs.filter(
      (log) => log.correctAnswers + log.wrongAnswers > 0,
    );

    if (scoredLogs.length === 0) return null;

    const scoreTotal = scoredLogs.reduce((total, log) => {
      const answers = log.correctAnswers + log.wrongAnswers;
      return total + (log.correctAnswers / answers) * 100;
    }, 0);

    return Math.round(scoreTotal / scoredLogs.length);
  }, [logs]);

  const initials = userInitials(user.name, user.email);

  function templateLabel(template: string) {
    const key = `dashboard.templates.${template}`;
    const label = t(key);
    return label === key ? template : label;
  }

  function activityClassLabels(activity: DashboardActivity) {
    if (activity.classIds.length === 0) return t("dashboard.noClass");

    return activity.classIds
      .map((classId) => {
        const item = classById.get(classId);
        return item
          ? `${localizeClassName(item.name, language)} (${item.accessCode})`
          : classId;
      })
      .join(" · ");
  }

  function classActivityCount(classId: string) {
    return activities.filter((activity) => activity.classIds.includes(classId))
      .length;
  }

  async function copyCode(code: string) {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setSuccess(t("dashboard.codeCopied"));
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch {
      setError(t("dashboard.copyFailed"));
    }
  }

  function cacheClassesForBuilder() {
    try {
      sessionStorage.setItem(CLASS_CACHE_KEY, JSON.stringify(classes));
    } catch {
      return;
    }
  }

  async function handleCreateClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingClass(true);
    setError("");
    setSuccess("");

    try {
      const payload = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className }),
      }).then((response) =>
        parseResponse<{ class: DashboardClass }>(
          response,
          t("dashboard.createClassFailed"),
        ),
      );

      setClasses((current) => [payload.class, ...current]);
      setClassName("");
      setSuccess(
        formatMessage(t("dashboard.classCreated"), {
          code: payload.class.accessCode,
        }),
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : t("dashboard.createClassFailed"),
      );
    } finally {
      setSavingClass(false);
    }
  }

  function startEditingClass(item: DashboardClass) {
    setEditingClassId(item.id);
    setEditingClassName(item.name);
    setError("");
    setSuccess("");
  }

  function cancelEditingClass() {
    setEditingClassId(null);
    setEditingClassName("");
  }

  async function handleUpdateClass(item: DashboardClass) {
    const name = editingClassName.trim();
    if (name.length < 2) {
      setError(t("dashboard.updateClassFailed"));
      return;
    }

    setUpdatingClassId(item.id);
    setError("");
    setSuccess("");

    try {
      const payload = await fetch(`/api/classes/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((response) =>
        parseResponse<{ class: DashboardClass }>(
          response,
          t("dashboard.updateClassFailed"),
        ),
      );

      setClasses((current) =>
        current.map((row) =>
          row.id === item.id ? payload.class : row,
        ),
      );
      setEditingClassId(null);
      setEditingClassName("");
      setSuccess(t("dashboard.classUpdated"));
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : t("dashboard.updateClassFailed"),
      );
    } finally {
      setUpdatingClassId(null);
    }
  }

  async function handleDeleteClass(item: DashboardClass) {
    const confirmed = window.confirm(
      formatMessage(t("dashboard.deleteClassConfirm"), {
        name: localizeClassName(item.name, language),
      }),
    );

    if (!confirmed) return;

    setDeletingClassId(item.id);
    setError("");
    setSuccess("");

    try {
      await fetch(`/api/classes/${item.id}`, {
        method: "DELETE",
      }).then((response) =>
        parseResponse<{ ok: boolean }>(
          response,
          t("dashboard.deleteClassFailed"),
        ),
      );

      setClasses((current) => current.filter((row) => row.id !== item.id));
      setActivities((current) =>
        current.map((activity) => ({
          ...activity,
          classIds: activity.classIds.filter((classId) => classId !== item.id),
        })),
      );
      if (editingClassId === item.id) {
        cancelEditingClass();
      }
      setSuccess(t("dashboard.classDeleted"));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : t("dashboard.deleteClassFailed"),
      );
    } finally {
      setDeletingClassId(null);
    }
  }

  async function handleDeleteActivity(activity: DashboardActivity) {
    const confirmed = window.confirm(
      formatMessage(t("dashboard.deleteActivityConfirm"), {
        title: localizeActivityTitle(activity.title, language),
      }),
    );

    if (!confirmed) return;

    setDeletingActivityId(activity.id);
    setError("");
    setSuccess("");

    try {
      await fetch(`/api/activities/${activity.id}`, {
        method: "DELETE",
      }).then((response) =>
        parseResponse<{ ok: boolean }>(
          response,
          t("dashboard.deleteActivityFailed"),
        ),
      );

      setActivities((current) =>
        current.filter((row) => row.id !== activity.id),
      );
      setSuccess(t("dashboard.activityDeleted"));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : t("dashboard.deleteActivityFailed"),
      );
    } finally {
      setDeletingActivityId(null);
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
      <div className="page-frame dashboard-frame">
        <header className="dashboard-header">
          <div className="dashboard-intro">
            <p className="eyebrow">{t("dashboard.instructorPanel")}</p>
            <h1>{t("dashboard.title")}</h1>
            <p className="muted">{t("dashboard.subtitle")}</p>
          </div>

          <div className="header-actions">
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

        <section className="demo-hero" aria-labelledby="demo-title">
          <div className="demo-hero-copy">
            <span className="demo-status-pill">{t("dashboard.demoBadge")}</span>
            <h2 id="demo-title">{t("dashboard.demoTitle")}</h2>
            <p>{t("dashboard.demoMission")}</p>
            <p>{t("dashboard.demoSubtitle")}</p>
            <div
              className="readiness-list"
              aria-label={t("dashboard.demoBadge")}
            >
              {READINESS_ITEMS.map((item) => (
                <span className="readiness-pill" key={item}>
                  {t(`dashboard.readiness.${item}`)}
                </span>
              ))}
            </div>
          </div>

          <aside className="demo-code-panel">
            <p className="eyebrow">{t("dashboard.demoPrimaryCode")}</p>
            <button
              className="copy-code-button demo-code"
              type="button"
              onClick={() => copyCode(featuredClass?.accessCode ?? "")}
              disabled={!featuredClass}
            >
              {featuredClass?.accessCode ?? t("dashboard.demoNoCode")}
            </button>
            <p className="muted">
              {featuredClass
                ? formatMessage(t("dashboard.demoCodeHelp"), {
                    className: localizeClassName(featuredClass.name, language),
                    activityName: demoActivityName,
                  })
                : t("dashboard.demoNoCodeHelp")}
            </p>
            {studentAppUrl ? (
              <a
                className="primary-action demo-student-link"
                href={studentAppUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("dashboard.openStudentApp")}
              </a>
            ) : null}
            <p className="muted">{t("dashboard.demoStudentHint")}</p>
          </aside>
        </section>

        <section
          className="quick-actions-panel"
          aria-labelledby="quick-actions-title"
        >
          <div className="quick-actions-copy">
            <span className="panel-icon" aria-hidden="true">
              Go
            </span>
            <h2 id="quick-actions-title">{t("dashboard.quickActionsTitle")}</h2>
            <p className="muted">{t("dashboard.quickActionsBody")}</p>
          </div>

          <div className="dashboard-action-grid">
            <Link
              className="dashboard-action-card dashboard-action-card--primary"
              href="/dashboard/activities/new"
              onClick={cacheClassesForBuilder}
              prefetch
            >
              <span className="action-icon" aria-hidden="true">
                <PlusCircle size={22} />
              </span>
              <span>{t("dashboard.createActivityCta")}</span>
              <strong>{t("dashboard.createActivityCtaBody")}</strong>
              <small>{t("dashboard.createActivityCtaMeta")}</small>
              <ArrowRight
                className="action-arrow"
                size={20}
                aria-hidden="true"
              />
            </Link>
            <a className="dashboard-action-card" href="#classes-panel">
              <span className="action-icon" aria-hidden="true">
                <UsersRound size={22} />
              </span>
              <span>{t("dashboard.manageClassesCta")}</span>
              <strong>
                {formatMessage(t("dashboard.manageClassesCtaMeta"), {
                  count: classes.length,
                })}
              </strong>
              <small>{t("dashboard.manageClassesCtaBody")}</small>
            </a>
            <a className="dashboard-action-card" href="#leaderboard-panel">
              <span className="action-icon" aria-hidden="true">
                <BarChart3 size={22} />
              </span>
              <span>{t("dashboard.reviewEvidenceCta")}</span>
              <strong>
                {formatMessage(t("dashboard.reviewEvidenceCtaMeta"), {
                  count: logs.length,
                })}
              </strong>
              <small>{t("dashboard.reviewEvidenceCtaBody")}</small>
            </a>
            <button
              className="dashboard-action-card"
              type="button"
              onClick={() => copyCode(featuredClass?.accessCode ?? "")}
              disabled={!featuredClass}
            >
              <span className="action-icon" aria-hidden="true">
                {copiedCode ? <Clipboard size={22} /> : <Copy size={22} />}
              </span>
              <span>{t("dashboard.testCodeCta")}</span>
              <strong>
                {copiedCode
                  ? t("dashboard.codeCopied")
                  : (featuredClass?.accessCode ?? t("dashboard.demoNoCode"))}
              </strong>
              <small>{t("dashboard.testCodeCtaBody")}</small>
            </button>
          </div>
        </section>

        <section
          className="reviewer-path"
          aria-label={t("dashboard.reviewPath")}
        >
          {REVIEW_STEPS.map((step, index) => (
            <article className="review-step" key={step}>
              <span className="review-step-number">{index + 1}</span>
              <div>
                <strong>
                  {step === "videoQuiz"
                    ? formatMessage(t("dashboard.reviewSteps.videoQuiz.title"), {
                        activityName: demoActivityName,
                      })
                    : t(`dashboard.reviewSteps.${step}.title`)}
                </strong>
                <p>{t(`dashboard.reviewSteps.${step}.body`)}</p>
              </div>
            </article>
          ))}
        </section>

        {error ? (
          <p className="page-error" role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="page-success" role="status" aria-live="polite">
            {success}
          </p>
        ) : null}

        <section
          className="stats-grid demo-stats-grid"
          aria-label={t("dashboard.instructorPanel")}
        >
          <a className="stat-card stat-card--classes" href="#classes-panel">
            <p className="stat-value">{classes.length}</p>
            <p className="stat-label">{t("dashboard.statsClasses")}</p>
          </a>
          <a
            className="stat-card stat-card--activities"
            href="#activities-panel"
          >
            <p className="stat-value">{activities.length}</p>
            <p className="stat-label">{t("dashboard.statsActivities")}</p>
          </a>
          <a className="stat-card stat-card--logs" href="#leaderboard-panel">
            <p className="stat-value">{logs.length}</p>
            <p className="stat-label">{t("dashboard.statsLogs")}</p>
          </a>
          <Link
            className="stat-card stat-card--ready"
            href="/dashboard/activities/new"
            onClick={cacheClassesForBuilder}
            prefetch
          >
            <p className="stat-value">{mobileReadyActivities.length}</p>
            <p className="stat-label">{t("dashboard.statsMobileReady")}</p>
          </Link>
        </section>

        <details className="dashboard-accordion" open>
          <summary className="accordion-summary">
            <span className="panel-icon" aria-hidden="true">
              ?
            </span>
            <span>
              <strong>{t("guide.title")}</strong>
              <small>{t("guide.body")}</small>
            </span>
            <span className="summary-count">{t("dashboard.expand")}</span>
          </summary>
          <div className="accordion-content">
            <ol className="dashboard-guide-steps">
              {GUIDE_STEPS.map((step, index) => (
                <li className="dashboard-guide-step" key={step}>
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
        </details>

        <section className="accordion-stack">
          <details className="dashboard-accordion" id="classes-panel" open>
            <summary className="accordion-summary">
              <span className="panel-icon" aria-hidden="true">
                01
              </span>
              <span>
                <strong>{t("dashboard.classesTitle")}</strong>
                <small>{t("dashboard.classesBody")}</small>
              </span>
              <span className="summary-count">
                {formatMessage(t("dashboard.countClasses"), {
                  count: classes.length,
                })}
              </span>
            </summary>

            <div className="accordion-content">
              <form className="compact-create-row" onSubmit={handleCreateClass}>
                <label>
                  {t("dashboard.className")}
                  <input
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    autoComplete="off"
                    placeholder={t("dashboard.classNamePlaceholder")}
                    required
                  />
                </label>
                <button
                  className="primary-action"
                  type="submit"
                  disabled={savingClass}
                >
                  {savingClass
                    ? t("dashboard.saving")
                    : t("dashboard.newClass")}
                </button>
              </form>

              <div className="class-card-list" aria-live="polite">
                {classes.map((item) => (
                  <article className="class-demo-card" key={item.id}>
                    {editingClassId === item.id ? (
                      <div className="class-edit-form">
                        <label>
                          {t("dashboard.className")}
                          <input
                            value={editingClassName}
                            onChange={(event) =>
                              setEditingClassName(event.target.value)
                            }
                            autoComplete="off"
                            required
                          />
                        </label>
                        <div className="row-actions">
                          <button
                            className="primary-action"
                            type="button"
                            disabled={updatingClassId === item.id}
                            onClick={() => handleUpdateClass(item)}
                          >
                            {updatingClassId === item.id
                              ? t("dashboard.saving")
                              : t("dashboard.saveChanges")}
                          </button>
                          <button
                            className="secondary-action"
                            type="button"
                            onClick={cancelEditingClass}
                          >
                            {t("dashboard.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <strong>
                            {localizeClassName(item.name, language)}
                          </strong>
                          <span>
                            {formatMessage(t("dashboard.classActivityCount"), {
                              count: classActivityCount(item.id),
                            })}
                          </span>
                        </div>
                        <div className="row-actions class-card-actions">
                          <button
                            className="copy-code-button access-code"
                            type="button"
                            onClick={() => copyCode(item.accessCode)}
                          >
                            {copiedCode === item.accessCode
                              ? t("dashboard.codeCopied")
                              : item.accessCode}
                          </button>
                          <button
                            className="secondary-action"
                            type="button"
                            onClick={() => startEditingClass(item)}
                          >
                            {t("dashboard.editClass")}
                          </button>
                          <button
                            className="secondary-action danger-action"
                            type="button"
                            disabled={deletingClassId === item.id}
                            onClick={() => handleDeleteClass(item)}
                          >
                            {deletingClassId === item.id
                              ? t("dashboard.saving")
                              : t("dashboard.deleteClass")}
                          </button>
                        </div>
                        <small>
                          {t("dashboard.createdOn")}{" "}
                          {dateFormatter.format(new Date(item.createdAt))}
                        </small>
                      </>
                    )}
                  </article>
                ))}
                {classes.length === 0 ? (
                  <p className="empty-state">{t("dashboard.emptyClasses")}</p>
                ) : null}
              </div>
            </div>
          </details>

          <details className="dashboard-accordion" id="activities-panel" open>
            <summary className="accordion-summary">
              <span className="panel-icon" aria-hidden="true">
                02
              </span>
              <span>
                <strong>{t("dashboard.publishedTitle")}</strong>
                <small>{t("dashboard.publishedBody")}</small>
              </span>
              <span className="summary-count">
                {formatMessage(t("dashboard.countActivities"), {
                  count: activities.length,
                })}
              </span>
            </summary>

            <div className="accordion-content">
              <Link
                className="primary-action dashboard-inline-action"
                href="/dashboard/activities/new"
                onClick={cacheClassesForBuilder}
                prefetch
              >
                {t("dashboard.createActivityCta")}
              </Link>

              <div className="activity-table">
                {activities.map((activity) => (
                  <article className="activity-row" key={activity.id}>
                    <div>
                      <strong>
                        {localizeActivityTitle(activity.title, language)}
                      </strong>
                      <span
                        className={templateBadgeClass(activity.templateType)}
                      >
                        {templateLabel(activity.templateType)}
                      </span>
                      <span>{activityClassLabels(activity)}</span>
                    </div>
                    <div className="activity-row-side">
                      <span
                        className={
                          isMobileReadyActivity(activity)
                            ? "score-pill"
                            : "readiness-warning"
                        }
                      >
                        {isMobileReadyActivity(activity)
                          ? t("dashboard.mobileReady")
                          : t("dashboard.mobilePending")}
                      </span>
                      <div className="row-actions">
                        <Link
                          className="secondary-action"
                          href={`/dashboard/activities/${activity.id}/edit`}
                          onClick={cacheClassesForBuilder}
                          prefetch
                        >
                          {t("dashboard.editActivity")}
                        </Link>
                        <button
                          className="secondary-action danger-action"
                          type="button"
                          disabled={deletingActivityId === activity.id}
                          onClick={() => handleDeleteActivity(activity)}
                        >
                          {deletingActivityId === activity.id
                            ? t("dashboard.saving")
                            : t("dashboard.deleteActivity")}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {activities.length === 0 ? (
                  <p className="empty-state">
                    {t("dashboard.emptyActivities")}
                  </p>
                ) : null}
              </div>
            </div>
          </details>

          <details className="dashboard-accordion" id="leaderboard-panel">
            <summary className="accordion-summary">
              <span className="panel-icon" aria-hidden="true">
                03
              </span>
              <span>
                <strong>{t("dashboard.leaderboardTitle")}</strong>
                <small>{t("dashboard.leaderboardBody")}</small>
              </span>
              <span className="summary-count">
                {formatMessage(t("dashboard.countLogs"), {
                  count: logs.length,
                })}
              </span>
            </summary>

            <div className="accordion-content">
              <div className="evidence-summary">
                <div>
                  <span>{t("dashboard.averageScore")}</span>
                  <strong>
                    {averageScore === null
                      ? t("dashboard.noScore")
                      : `${averageScore}%`}
                  </strong>
                </div>
                <div>
                  <span>{t("dashboard.latestEvidence")}</span>
                  <strong>
                    {latestLog
                      ? localizeActivityTitle(
                          latestLog.activityTitle,
                          language,
                        )
                      : t("dashboard.noEvidenceYet")}
                  </strong>
                </div>
              </div>

              <div className="activity-table">
                {logs.map((log) => (
                  <article className="activity-row" key={log.id}>
                    <div>
                      <strong>
                        {log.studentName?.trim() ||
                          t("dashboard.anonymousStudent")}
                      </strong>
                      <span>
                        {localizeActivityTitle(log.activityTitle, language)} ·{" "}
                        {(log.className
                          ? localizeClassName(log.className, language)
                          : null) || t("dashboard.noClass")}{" "}
                        {log.classAccessCode ? `(${log.classAccessCode})` : ""}
                      </span>
                    </div>
                    <span
                      className="score-pill"
                      aria-label={t("dashboard.leaderboardTitle")}
                    >
                      {formatMessage(t("dashboard.score"), {
                        correct: log.correctAnswers,
                        wrong: log.wrongAnswers,
                        seconds: Math.round(log.responseTimeSeconds),
                      })}
                    </span>
                  </article>
                ))}
                {logs.length === 0 ? (
                  <p className="empty-state">{t("dashboard.emptyLogs")}</p>
                ) : null}
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
