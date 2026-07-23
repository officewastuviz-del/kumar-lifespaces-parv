"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Chapter = {
  label: string;
  kicker: string;
  src: string;
  duration: number;
};

type Panel = "map" | "residences" | "project" | null;

const chapters: Chapter[] = [
  { label: "Grand Arrival", kicker: "01 / Arrival", src: "/enhanced/clip-grand-arrival-enhanced.mp4", duration: 13.5 },
  { label: "Outdoor Play", kicker: "02 / Active Life", src: "/enhanced/clip-outdoor-play-enhanced.mp4", duration: 14 },
  { label: "Indoor Pool", kicker: "03 / Recreation", src: "/enhanced/clip-indoor-pool-enhanced.mp4", duration: 6.5 },
  { label: "The Lobby", kicker: "04 / Welcome", src: "/enhanced/clip-lobby-enhanced.mp4", duration: 18 },
  { label: "Fitness", kicker: "05 / Movement", src: "/enhanced/clip-fitness-enhanced.mp4", duration: 9 },
  { label: "Indoor Games", kicker: "06 / Togetherness", src: "/enhanced/clip-indoor-games-enhanced.mp4", duration: 9 },
  { label: "Wellness", kicker: "07 / Calm", src: "/enhanced/clip-wellness-enhanced.mp4", duration: 16 },
  { label: "Day Care", kicker: "08 / Little Worlds", src: "/enhanced/clip-day-care-enhanced.mp4", duration: 5 },
  { label: "Outdoor Decks", kicker: "09 / Open Skies", src: "/enhanced/clip-outdoor-decks-enhanced.mp4", duration: 11 },
  { label: "Signature Tower", kicker: "10 / Parv", src: "/enhanced/clip-signature-tower-enhanced.mp4", duration: 10 },
];

const mapSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=Kumar+Parv%2C+MRCM%2B7MC%2C+Woodsville+St%2C+Aher%2C+Moshi%2C+Pimpri-Chinchwad%2C+Pune%2C+Maharashtra+412105";
const mapEmbedUrl =
  "https://www.google.com/maps?q=Kumar%20Parv%2C%20MRCM%2B7MC%2C%20Woodsville%20St%2C%20Aher%2C%20Moshi%2C%20Pimpri-Chinchwad%2C%20Pune%20412105&output=embed";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const chapterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entered, setEntered] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [filmMode, setFilmMode] = useState(false);
  const [openNavigation, setOpenNavigation] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showChapter, setShowChapter] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [volume, setVolume] = useState(0.75);

  const revealChapter = useCallback(() => {
    setShowChapter(true);
    if (chapterTimer.current) window.clearTimeout(chapterTimer.current);
    chapterTimer.current = window.setTimeout(() => setShowChapter(false), 2400);
  }, []);

  const playChapter = useCallback((index: number, guided = false) => {
    setActiveChapter(index);
    setFilmMode(guided);
    setOpenNavigation(null);
    setPanel(null);
    setVideoFailed(false);
    setIsPlaying(true);
    revealChapter();
  }, [revealChapter]);

  const closePanel = useCallback(() => {
    setPanel(null);
    const video = videoRef.current;
    if (video) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const video = videoRef.current;
      setEntered(true);
      revealChapter();
      if (!video) return;
      video.muted = false;
      setIsMuted(false);
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [revealChapter]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
        setOpenNavigation(null);
        return;
      }
      if (!entered || panel) return;
      if (event.key === "ArrowRight") playChapter((activeChapter + 1) % chapters.length);
      if (event.key === "ArrowLeft") playChapter((activeChapter - 1 + chapters.length) % chapters.length);
      if (event.key === " ") {
        event.preventDefault();
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play().then(() => setIsPlaying(true)).catch(() => undefined);
        else {
          video.pause();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeChapter, closePanel, entered, panel, playChapter]);

  useEffect(() => () => {
    if (chapterTimer.current) window.clearTimeout(chapterTimer.current);
  }, []);

  const videoSrc = entered
    ? chapters[activeChapter].src
    : "/enhanced/clip-parv-brand-enhanced.mp4";

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !entered) return;
    const duration = chapters[activeChapter].duration;
    if (video.currentTime < duration - 0.08) return;
    if (filmMode) playChapter((activeChapter + 1) % chapters.length, true);
    else {
      video.currentTime = 0;
      video.play().catch(() => undefined);
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const setVideoVolume = (value: number) => {
    const video = videoRef.current;
    setVolume(value);
    if (!video) return;
    video.volume = value;
    if (value > 0 && video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const openPanel = (nextPanel: Exclude<Panel, null>) => {
    videoRef.current?.pause();
    setIsPlaying(false);
    setOpenNavigation(null);
    setPanel(nextPanel);
  };

  const toggleNavigation = (name: string) => {
    setOpenNavigation((current) => current === name ? null : name);
  };

  return (
    <main id="app" aria-busy={!entered} className={isPlaying ? "is-playing" : ""}>
      <video
        ref={videoRef}
        className="hero-video"
        src={videoSrc}
        muted={isMuted}
        autoPlay
        playsInline
        preload="metadata"
        aria-label="A cinematic tour of Kumar Lifespaces Parv"
        onLoadedMetadata={(event) => {
          event.currentTarget.currentTime = 0;
          event.currentTarget.volume = volume;
          event.currentTarget.play().then(() => setIsPlaying(entered)).catch(() => setIsPlaying(false));
        }}
        onCanPlay={(event) => {
          setVideoFailed(false);
          event.currentTarget.play().then(() => setIsPlaying(entered)).catch(() => setIsPlaying(false));
        }}
        onTimeUpdate={handleTimeUpdate}
        onError={() => {
          setVideoFailed(true);
          setIsPlaying(false);
        }}
      />
      <div className="video-shade" aria-hidden="true" />

      <div className="brand developer-brand" aria-label="Project by Kumar Lifespaces">
        <span className="brand-copy">
          <small>Project by</small>
          <strong><b>K</b>UMAR <em>LIFESPACES</em></strong>
          <i>BUILDING LEGACIES</i>
        </span>
      </div>

      <div className="project-brand" aria-label="Kumar Lifespaces Parv">
        <strong>KUMAR LIFESPACES PARV</strong>
      </div>

      <button className="rera-badge glass" type="button" onClick={() => openPanel("project")} aria-label="View MahaRERA project registrations">
        <span className="rera-mark">R</span>
        <span>
          <small>MAHARERA REG. NO.</small>
          <strong>P52100055932</strong>
          <strong>P52100056164</strong>
          <em>VIEW PROJECT DETAILS</em>
        </span>
      </button>

      <section className="location-dock glass" aria-label="Experience navigation">
        <div className="dock-heading"><span>NAVIGATION</span><span>SELECT</span></div>
        <nav id="location-list">
          <div className={`nav-item nav-level-0 ${openNavigation === "location" ? "open" : ""}`}>
            <button className="nav-action nav-parent" onClick={() => toggleNavigation("location")}>
              <span className="nav-copy"><strong>Location</strong><small>Moshi · Pune</small></span><span className="arrow">+</span>
            </button>
            <div className="nav-children">
              <button className="nav-action nav-leaf" onClick={() => openPanel("map")}>
                <span className="nav-copy"><strong>Actual Google Map</strong></span><span className="arrow">↗</span>
              </button>
            </div>
          </div>

          <div className={`nav-item nav-level-0 ${openNavigation === "residences" ? "open" : ""}`}>
            <button className="nav-action nav-parent" onClick={() => toggleNavigation("residences")}>
              <span className="nav-copy"><strong>Flat Options</strong><small>2 &amp; 3 BHK</small></span><span className="arrow">+</span>
            </button>
            <div className="nav-children">
              <button className="nav-action nav-leaf" onClick={() => openPanel("residences")}>
                <span className="nav-copy"><strong>View Residences</strong></span><span className="arrow">↗</span>
              </button>
            </div>
          </div>

          <div className={`nav-item nav-level-0 ${openNavigation === "amenities" ? "open" : ""}`}>
            <button className="nav-action nav-parent" onClick={() => toggleNavigation("amenities")}>
              <span className="nav-copy"><strong>Amenities</strong><small>Life at Parv</small></span><span className="arrow">+</span>
            </button>
            <div className="nav-children">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.label}
                  className={`nav-action nav-leaf ${activeChapter === index && !filmMode ? "active" : ""}`}
                  onClick={() => playChapter(index)}
                >
                  <span className="nav-copy"><strong>{chapter.label}</strong></span><span className="arrow">↗</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`nav-item nav-level-0 ${openNavigation === "project" ? "open" : ""}`}>
            <button className="nav-action nav-parent" onClick={() => toggleNavigation("project")}>
              <span className="nav-copy"><strong>Project</strong><small>Overview &amp; RERA</small></span><span className="arrow">+</span>
            </button>
            <div className="nav-children">
              <button className="nav-action nav-leaf" onClick={() => openPanel("project")}>
                <span className="nav-copy"><strong>Project Details</strong></span><span className="arrow">↗</span>
              </button>
            </div>
          </div>

          <div className="nav-item nav-level-0">
            <button className="nav-action nav-parent" onClick={() => playChapter(0, true)}>
              <span className="nav-copy"><strong>Full Film</strong><small>Cinematic Tour</small></span><span className="arrow">↗</span>
            </button>
          </div>
        </nav>
      </section>

      <section className="status-bar glass" aria-label="Playback controls">
        <div className="state">
          <i className={isPlaying ? "active" : ""} />
          <span>{videoFailed ? "ERROR" : isPlaying ? "PLAYING" : "IDLE"}</span>
        </div>
        <div id="equalizer" aria-label="Audio activity">
          {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
        </div>
        <div className="media-controls">
          <button className={`icon-button ${!isMuted ? "active" : ""}`} type="button" onClick={toggleSound}>
            {isMuted ? "MUSIC OFF" : "MUSIC ON"}
          </button>
          <span className="volume-label">MUSIC</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVideoVolume(Number(event.target.value))} aria-label="Video volume" />
          <span className="volume-label voice-label">VOICE</span>
          <input type="range" min="0" max="1" step="0.01" defaultValue="0.7" aria-label="Narration volume" />
          <button className={`text-button ${captions ? "active" : ""}`} type="button" onClick={() => setCaptions((active) => !active)}>CC</button>
          <button className="text-button" type="button" onClick={() => playChapter(0, true)}>FILM</button>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) document.getElementById("app")?.requestFullscreen?.();
              else document.exitFullscreen?.();
            }}
          >FULL</button>
        </div>
      </section>

      <div className="chapter-title" hidden={!showChapter} aria-live="polite">
        <span>{filmMode ? "GUIDED FILM" : chapters[activeChapter].kicker.toUpperCase()}</span>
        <strong>{filmMode ? "THE PARV FILM" : chapters[activeChapter].label.toUpperCase()}</strong>
        <small>Kumar Lifespaces Parv · Moshi</small>
      </div>

      {videoFailed && (
        <div className="video-status error">
          <span>VIDEO COULD NOT START</span>
          <button type="button" onClick={() => {
            const video = videoRef.current;
            setVideoFailed(false);
            video?.load();
            video?.play().catch(() => undefined);
          }}>RETRY</button>
        </div>
      )}

      {!entered && (
        <section className="entry-screen" aria-label="Kumar Lifespaces Parv logo reveal">
          <div className="intro-animation">
            <img className="intro-logo" src="/parv-logo-hd.png" alt="Kumar Lifespaces Parv" fetchPriority="high" decoding="sync" />
            <div className="intro-progress"><i /></div>
          </div>
        </section>
      )}

      <dialog
        ref={dialogRef}
        className={`experience-dialog ${panel === "map" ? "map-dialog" : ""}`}
        onCancel={(event) => {
          event.preventDefault();
          closePanel();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePanel();
        }}
      >
        {panel === "map" && (
          <section className="dialog-shell">
            <header className="dialog-header">
              <div><span className="eyebrow">LOCATION</span><h2>Kumar Parv, Moshi</h2></div>
              <div className="dialog-actions">
                <a href={mapSearchUrl} target="_blank" rel="noreferrer">OPEN IN MAPS</a>
                <button className="close-button" type="button" onClick={closePanel} aria-label="Close map">X</button>
              </div>
            </header>
            <div className="map-body">
              <iframe src={mapEmbedUrl} title="Google Map showing Kumar Parv in Moshi" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </section>
        )}

        {panel === "residences" && (
          <section className="dialog-shell">
            <header className="dialog-header">
              <div><span className="eyebrow">FLAT OPTIONS</span><h2>Homes at Parv</h2></div>
              <button className="close-button" type="button" onClick={closePanel} aria-label="Close residences">X</button>
            </header>
            <div className="residence-grid">
              <article><span>RESIDENCE 01</span><h3>2 BHK</h3><p>Considered urban homes shaped around light, privacy and modern family routines.</p></article>
              <article><span>RESIDENCE 02</span><h3>3 BHK</h3><p>Generous premium homes with room for family, work and moments of quiet.</p></article>
            </div>
          </section>
        )}

        {panel === "project" && (
          <section className="dialog-shell">
            <header className="dialog-header">
              <div><span className="eyebrow">PROJECT</span><h2>Kumar Lifespaces Parv</h2></div>
              <button className="close-button" type="button" onClick={closePanel} aria-label="Close project details">X</button>
            </header>
            <div className="project-grid">
              <div><span>CONFIGURATION</span><strong>2 &amp; 3 BHK premium homes</strong></div>
              <div><span>LOCATION</span><strong>Moshi, Pune</strong></div>
              <div><span>MAHARERA</span><strong>P52100055932<br />P52100056164</strong></div>
              <div><span>ADDRESS</span><strong>Woodsville St, Aher, Moshi, Pimpri-Chinchwad, Pune 412105</strong></div>
            </div>
          </section>
        )}
      </dialog>
    </main>
  );
}
