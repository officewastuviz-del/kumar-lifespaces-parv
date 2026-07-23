"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Chapter = {
  label: string;
  eyebrow: string;
  src: string;
  duration: number;
};

type Panel = "location" | "residences" | "project" | null;

const chapters: Chapter[] = [
  {
    label: "Grand Arrival",
    eyebrow: "01 / Arrival",
    src: "/clip-grand-arrival.mp4",
    duration: 13.5,
  },
  {
    label: "Outdoor Play",
    eyebrow: "02 / Active life",
    src: "/clip-outdoor-play.mp4",
    duration: 14,
  },
  {
    label: "Indoor Pool",
    eyebrow: "03 / Recreation",
    src: "/clip-indoor-pool.mp4",
    duration: 6.5,
  },
  {
    label: "The Lobby",
    eyebrow: "04 / Welcome",
    src: "/clip-lobby.mp4",
    duration: 18,
  },
  {
    label: "Fitness",
    eyebrow: "05 / Movement",
    src: "/clip-fitness.mp4",
    duration: 9,
  },
  {
    label: "Indoor Games",
    eyebrow: "06 / Togetherness",
    src: "/clip-indoor-games.mp4",
    duration: 9,
  },
  {
    label: "Wellness",
    eyebrow: "07 / Calm",
    src: "/clip-wellness.mp4",
    duration: 16,
  },
  {
    label: "Day Care",
    eyebrow: "08 / Little worlds",
    src: "/clip-day-care.mp4",
    duration: 5,
  },
  {
    label: "Outdoor Decks",
    eyebrow: "09 / Open skies",
    src: "/clip-outdoor-decks.mp4",
    duration: 11,
  },
  {
    label: "Signature Tower",
    eyebrow: "10 / Parv",
    src: "/clip-signature-tower.mp4",
    duration: 10,
  },
];

const locationAdvantages = [
  ["Pune–Nashik Highway", "2 km"],
  ["Bhosari", "5 km"],
  ["Chikhali", "6 km"],
  ["Talawade IT Park", "6.8 km"],
  ["Pimpri Proposed Metro", "6.8 km"],
  ["Pimpri–Chinchwad", "9.5 km"],
];

const mapSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=Kumar+Parv%2C+MRCM%2B7MC%2C+Woodsville+St%2C+Aher%2C+Moshi%2C+Pimpri-Chinchwad%2C+Pune%2C+Maharashtra+412105";
const mapEmbedUrl =
  "https://www.google.com/maps?q=Kumar%20Parv%2C%20MRCM%2B7MC%2C%20Woodsville%20St%2C%20Aher%2C%20Moshi%2C%20Pimpri-Chinchwad%2C%20Pune%20412105&output=embed";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [entered, setEntered] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [chapterMenu, setChapterMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [filmMode, setFilmMode] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const playChapter = useCallback((index: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => undefined);
    setActiveChapter(index);
    setFilmMode(false);
    setIsPlaying(true);
    setChapterMenu(false);
    setPanel(null);
    setProgress(0);
    setVideoReady(false);
    setVideoFailed(false);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      video.currentTime = 0;
      video.play().catch(() => setIsPlaying(false));
    };
    const onTime = () => {
      if (!entered) {
        if (video.currentTime >= 10.5) {
          video.currentTime = 0;
          video.play().catch(() => undefined);
        }
        return;
      }
      const chapter = chapters[activeChapter];
      if (filmMode) {
        setProgress(Math.min(video.currentTime / chapter.duration, 1));
        if (video.currentTime >= chapter.duration - 0.08) {
          video.pause();
          setProgress(0);
          setVideoReady(false);
          setActiveChapter((index) => (index + 1) % chapters.length);
        }
        return;
      }
      const chapterProgress = video.currentTime / chapter.duration;
      setProgress(Math.max(0, Math.min(chapterProgress, 1)));
      if (video.currentTime >= chapter.duration - 0.08) {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    if (video.readyState >= 1) onLoaded();
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [activeChapter, entered, filmMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      enterExperience();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setChapterMenu(false);
      }
      if (!entered || panel) return;
      if (event.key === "ArrowRight") {
        playChapter((activeChapter + 1) % chapters.length);
      }
      if (event.key === "ArrowLeft") {
        playChapter((activeChapter - 1 + chapters.length) % chapters.length);
      }
      if (event.key === " ") {
        event.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const enterExperience = () => {
    const video = videoRef.current;
    if (!video) return;
    setEntered(true);
    setIsMuted(false);
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => undefined);
    });
  };

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => undefined);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const playFullFilm = () => {
    const video = videoRef.current;
    if (!video) return;
    setPanel(null);
    setChapterMenu(false);
    setFilmMode(true);
    setActiveChapter(0);
    video.currentTime = 0;
    video.play().catch(() => undefined);
    setIsPlaying(true);
    setProgress(0);
    setVideoReady(false);
    setVideoFailed(false);
  };

  const openPanel = (nextPanel: Exclude<Panel, null>) => {
    setPanel(nextPanel);
    setChapterMenu(false);
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const closePanel = () => {
    setPanel(null);
    videoRef.current?.play().catch(() => undefined);
    setIsPlaying(true);
  };

  const currentLabel = filmMode ? "The Parv Film" : chapters[activeChapter].label;
  const currentEyebrow = filmMode
    ? "Kumar Lifespaces / Moshi"
    : chapters[activeChapter].eyebrow;
  const videoSrc = entered
    ? chapters[activeChapter].src
    : "/clip-parv-brand.mp4";

  const retryVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoFailed(false);
    setVideoReady(false);
    video.load();
    video.play().catch(() => setIsPlaying(false));
  };

  return (
    <main className="experience">
      <video
        ref={videoRef}
        className={`stage-video ${videoReady ? "" : "is-loading"}`}
        src={videoSrc}
        poster="/parv-social.png"
        muted={isMuted}
        autoPlay
        playsInline
        preload="metadata"
        onLoadStart={() => {
          setVideoReady(false);
          setVideoFailed(false);
        }}
        onCanPlay={() => {
          setVideoReady(true);
          setVideoFailed(false);
        }}
        onError={() => {
          setVideoFailed(true);
          setVideoReady(false);
        }}
        aria-label="A cinematic tour of Kumar Lifespaces Parv"
      />
      <div className="film-grade" />
      <div className="film-grain" />
      {videoFailed && (
        <div className="video-status is-error">
          <span>Video could not start</span>
          <button onClick={retryVideo}>Retry video</button>
        </div>
      )}

      {!entered ? (
        <section className="entry-screen" aria-label="Kumar Lifespaces Parv logo reveal">
          <div className="entry-shade" />
          <div className="entry-brand">
            <img
              className="entry-logo-image"
              src="/parv-logo.png"
              alt="Kumar Lifespaces Parv"
              fetchPriority="high"
              decoding="sync"
            />
            <div className="logo-reveal-progress" aria-hidden="true"><span /></div>
          </div>
        </section>
      ) : (
        <>
          <header className="topbar">
            <button
              className="wordmark"
              onClick={() => playChapter(0)}
              aria-label="Return to the beginning"
            >
              <span className="k-mark">K</span>
              <span>
                <b>Kumar Lifespaces</b>
                <em>PARV</em>
              </span>
            </button>

            <nav aria-label="Primary navigation">
              <button onClick={() => openPanel("location")}>Location</button>
              <button onClick={() => openPanel("residences")}>Residences</button>
              <button onClick={() => setChapterMenu((open) => !open)}>
                Amenities
              </button>
              <button onClick={() => openPanel("project")}>Project</button>
              <button onClick={playFullFilm}>Full film</button>
            </nav>

            <div className="top-actions">
              <button className="icon-button" onClick={toggleSound}>
                {isMuted ? "Sound off" : "Sound on"}
              </button>
              <button
                className="menu-button"
                onClick={() => setChapterMenu((open) => !open)}
                aria-expanded={chapterMenu}
                aria-label="Open chapter navigation"
              >
                <span />
                <span />
              </button>
            </div>
          </header>

          <section className="stage-copy" aria-live="polite">
            <p>{currentEyebrow}</p>
            <h2>{currentLabel}</h2>
            <button onClick={togglePlayback} className="play-control">
              <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
              {isPlaying ? "Pause scene" : "Play scene"}
            </button>
          </section>

          <div className="bottom-rail">
            <span className="rail-index">
              {filmMode
                ? "FILM"
                : String(activeChapter + 1).padStart(2, "0")}
            </span>
            <div className="progress-track" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <button
              onClick={() =>
                playChapter((activeChapter + 1) % chapters.length)
              }
              className="next-scene"
            >
              Next scene <span aria-hidden="true">→</span>
            </button>
          </div>

          <aside className={`chapter-drawer ${chapterMenu ? "is-open" : ""}`}>
            <div className="drawer-head">
              <p>Explore Parv</p>
              <button onClick={() => setChapterMenu(false)}>Close</button>
            </div>
            <div className="chapter-list">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.label}
                  className={activeChapter === index && !filmMode ? "active" : ""}
                  onClick={() => playChapter(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{chapter.label}</strong>
                  <em>View</em>
                </button>
              ))}
            </div>
          </aside>
          {chapterMenu && (
            <button
              className="drawer-backdrop"
              onClick={() => setChapterMenu(false)}
              aria-label="Close chapter navigation"
            />
          )}
        </>
      )}

      {panel && (
        <section className={`info-panel ${panel === "location" ? "map-panel" : ""}`}>
          <div className="panel-top">
            <div className="panel-brand">
              <span className="k-mark">K</span>
              <span>PARV</span>
            </div>
            <button onClick={closePanel} className="panel-close">
              Close <span aria-hidden="true">×</span>
            </button>
          </div>

          {panel === "location" && (
            <div className="location-layout">
              <div className="location-copy">
                <p className="panel-kicker">Connected by choice</p>
                <h2>Moshi,<br />Pune</h2>
                <p className="panel-intro">
                  At Woodsville Street in Moshi, Parv places everyday work,
                  learning and city connections comfortably within reach.
                </p>
                <div className="distance-list">
                  {locationAdvantages.map(([place, distance]) => (
                    <div key={place}>
                      <span>{place}</span>
                      <strong>{distance}</strong>
                    </div>
                  ))}
                </div>
                <a href={mapSearchUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="map-frame">
                <iframe
                  src={mapEmbedUrl}
                  title="Google Map showing Kumar Parv in Moshi"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="map-address">
                  <span>Actual project location</span>
                  <strong>
                    Woodsville St, Aher, Moshi, Pimpri-Chinchwad, Pune 412105
                  </strong>
                </div>
              </div>
            </div>
          )}

          {panel === "residences" && (
            <div className="editorial-panel">
              <div className="editorial-lead">
                <p className="panel-kicker">Homes for a fuller life</p>
                <h2>Space to<br />be yourself.</h2>
                <p className="panel-intro">
                  Premium residences shaped around natural light, purposeful
                  planning and the everyday ease of a complete community.
                </p>
              </div>
              <div className="residence-options">
                <article>
                  <span>Residence 01</span>
                  <h3>2 BHK</h3>
                  <p>Considered urban homes for growing families and modern routines.</p>
                </article>
                <article>
                  <span>Residence 02</span>
                  <h3>3 BHK</h3>
                  <p>Generous premium homes with room for family, work and quiet.</p>
                </article>
                <button onClick={() => playChapter(9)}>
                  Experience the architecture <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}

          {panel === "project" && (
            <div className="editorial-panel">
              <div className="editorial-lead">
                <p className="panel-kicker">Kumar Lifespaces</p>
                <h2>A landmark<br />called Parv.</h2>
                <p className="panel-intro">
                  A premium residential address in Moshi bringing architecture,
                  recreation and everyday wellbeing together.
                </p>
              </div>
              <div className="project-facts">
                <div>
                  <span>Project</span>
                  <strong>Kumar Lifespaces Parv</strong>
                </div>
                <div>
                  <span>Configuration</span>
                  <strong>2 &amp; 3 BHK premium homes</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>Moshi, Pune</strong>
                </div>
                <div>
                  <span>MahaRERA</span>
                  <strong>P52100055932<br />P52100056164</strong>
                </div>
                <button onClick={playFullFilm}>
                  Watch the Parv film <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
