"use client";

import { SAMPLE_LIBRAS_VIDEOS } from "../lib/sample-videos";
import { useLanguage } from "../lib/contexts/language-context";

type LibrasVideoFieldProps = {
  value: string;
  onChange: (url: string) => void;
};

function localizedVideoCopy(
  t: (path: string) => string,
  videoId: string,
  field: "label" | "description",
  fallback: string,
) {
  const key = `dashboard.sampleVideos.${videoId}.${field}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function LibrasVideoField({ onChange, value }: LibrasVideoFieldProps) {
  const { t } = useLanguage();
  const presetId =
    SAMPLE_LIBRAS_VIDEOS.find((video) => video.url === value)?.id ?? "custom";
  const selectedVideo = SAMPLE_LIBRAS_VIDEOS.find(
    (video) => video.id === presetId,
  );

  return (
    <fieldset className="video-field">
      <div className="video-field-head">
        <legend>{t("dashboard.librasVideoUrl")}</legend>
        {selectedVideo ? (
          <span className="selected-video-pill">
            {t("dashboard.selectedVideo")}
          </span>
        ) : null}
      </div>

      <div className="video-library" aria-label={t("dashboard.videoLibrary")}>
        {SAMPLE_LIBRAS_VIDEOS.map((video) => {
          const selected = video.url === value;

          return (
            <article
              className={selected ? "video-card selected" : "video-card"}
              key={video.id}
            >
              <video
                aria-label={`${t("dashboard.previewVideo")}: ${localizedVideoCopy(t, video.id, "label", video.label)}`}
                controls
                muted
                playsInline
                preload="metadata"
                src={video.url}
              />
              <div className="video-card-copy">
                <strong>
                  {localizedVideoCopy(t, video.id, "label", video.label)}
                </strong>
                <span>
                  {localizedVideoCopy(
                    t,
                    video.id,
                    "description",
                    video.description,
                  )}
                </span>
              </div>
              <button
                className={selected ? "primary-action" : "secondary-action"}
                type="button"
                onClick={() => onChange(video.url)}
              >
                {selected
                  ? t("dashboard.selectedVideo")
                  : t("dashboard.useVideo")}
              </button>
            </article>
          );
        })}
      </div>

      <div className="custom-video-row">
        <label>
          {t("dashboard.videoCustom")}
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            inputMode="url"
            placeholder="https://..."
            required
          />
        </label>
      </div>
      <p className="video-field-hint muted">{t("dashboard.videoHint")}</p>
    </fieldset>
  );
}
