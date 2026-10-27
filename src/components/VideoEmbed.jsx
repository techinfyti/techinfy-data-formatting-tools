import { useEffect, useState } from "react";
import "./VideoEmbed.css";

const VIDEO_ID = "d8HFYcG-gvA";
const TITLE = "TechInfy Data Tools: Free Online Delimiter Converter, JSON Formatter & More";

export default function VideoEmbed() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: TITLE,
      description:
        "A 48-second tour of TechInfy Data Tools: the delimiter converter, one-click formatting, CSV/XML/YAML/Excel to JSON converters, the JSON formatter and ready-made presets — all free and running in your browser.",
      thumbnailUrl: "https://delimitertool.com/video-poster.jpg",
      uploadDate: "2026-10-27",
      duration: "PT48S",
      embedUrl: `https://www.youtube.com/embed/${VIDEO_ID}`,
      contentUrl: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    });
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  return (
    <div className="video-embed">
      {playing ? (
        <iframe
          className="video-embed__frame"
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
          title={TITLE}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="video-embed__poster"
          onClick={() => setPlaying(true)}
          aria-label="Play the TechInfy Data Tools video"
        >
          <img
            src="/video-poster.jpg"
            alt=""
            width="1280"
            height="720"
            loading="lazy"
            className="video-embed__img"
          />
          <span className="video-embed__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
