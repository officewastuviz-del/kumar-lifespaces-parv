const chapters = [
  ["Grand Arrival", "01 / Arrival", "public/clip-grand-arrival.mp4", 13.5],
  ["Outdoor Play", "02 / Active life", "public/clip-outdoor-play.mp4", 14],
  ["Indoor Pool", "03 / Recreation", "public/clip-indoor-pool.mp4", 6.5],
  ["The Lobby", "04 / Welcome", "public/clip-lobby.mp4", 18],
  ["Fitness", "05 / Movement", "public/clip-fitness.mp4", 9],
  ["Indoor Games", "06 / Togetherness", "public/clip-indoor-games.mp4", 9],
  ["Wellness", "07 / Calm", "public/clip-wellness.mp4", 16],
  ["Day Care", "08 / Little worlds", "public/clip-day-care.mp4", 5],
  ["Outdoor Decks", "09 / Open skies", "public/clip-outdoor-decks.mp4", 11],
  ["Signature Tower", "10 / Parv", "public/clip-signature-tower.mp4", 10],
];

const video = document.querySelector("#stageVideo");
const entry = document.querySelector("#entryScreen");
const shell = document.querySelector("#experienceShell");
const drawer = document.querySelector("#chapterDrawer");
const backdrop = document.querySelector("#drawerBackdrop");
const infoPanel = document.querySelector("#infoPanel");
const status = document.querySelector("#videoStatus");
const statusText = document.querySelector("#videoStatusText");
const retryButton = document.querySelector("#retryVideo");
const progressBar = document.querySelector("#progressBar");
const sceneLabel = document.querySelector("#sceneLabel");
const sceneEyebrow = document.querySelector("#sceneEyebrow");
const railIndex = document.querySelector("#railIndex");
const playIcon = document.querySelector("#playIcon");
const playText = document.querySelector("#playText");
const soundToggle = document.querySelector("#soundToggle");

let entered = false;
let activeChapter = 0;
let filmMode = false;

function updateSceneCopy() {
  sceneLabel.textContent = filmMode ? "The Parv Film" : chapters[activeChapter][0];
  sceneEyebrow.textContent = filmMode ? "Kumar Lifespaces / Moshi" : chapters[activeChapter][1];
  railIndex.textContent = filmMode ? "FILM" : String(activeChapter + 1).padStart(2, "0");
  document.querySelectorAll("#chapterList button").forEach((button, index) => {
    button.classList.toggle("active", !filmMode && index === activeChapter);
  });
}

function loadChapter(index, asFilm = false) {
  activeChapter = index;
  filmMode = asFilm;
  progressBar.style.transform = "scaleX(0)";
  status.hidden = false;
  status.classList.remove("is-error");
  statusText.textContent = "Loading scene…";
  retryButton.hidden = true;
  video.src = chapters[index][2];
  video.load();
  video.play().catch(() => {
    playIcon.textContent = "▶";
    playText.textContent = "Play scene";
  });
  closeDrawer();
  closePanel(false);
  updateSceneCopy();
}

function openDrawer() {
  drawer.classList.add("is-open");
  backdrop.hidden = false;
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  backdrop.hidden = true;
}

function openPanel(name) {
  video.pause();
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
  infoPanel.hidden = false;
}

function closePanel(resume = true) {
  infoPanel.hidden = true;
  if (resume && entered) video.play().catch(() => undefined);
}

function togglePlayback() {
  if (video.paused) {
    video.play().catch(() => undefined);
    playIcon.textContent = "Ⅱ";
    playText.textContent = "Pause scene";
  } else {
    video.pause();
    playIcon.textContent = "▶";
    playText.textContent = "Play scene";
  }
}

chapters.forEach((chapter, index) => {
  const button = document.createElement("button");
  button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${chapter[0]}</strong><em>View</em>`;
  button.addEventListener("click", () => loadChapter(index));
  document.querySelector("#chapterList").appendChild(button);
});

video.addEventListener("loadstart", () => {
  status.hidden = false;
  video.classList.add("is-loading");
});

video.addEventListener("canplay", () => {
  status.hidden = true;
  video.classList.remove("is-loading");
  video.play().catch(() => undefined);
});

video.addEventListener("error", () => {
  status.hidden = false;
  status.classList.add("is-error");
  statusText.textContent = "Video could not start";
  retryButton.hidden = false;
});

video.addEventListener("timeupdate", () => {
  if (!entered) {
    if (video.currentTime >= 10.5) video.currentTime = 0;
    return;
  }
  const duration = chapters[activeChapter][3];
  progressBar.style.transform = `scaleX(${Math.min(video.currentTime / duration, 1)})`;
  if (video.currentTime >= duration - 0.08) {
    if (filmMode) loadChapter((activeChapter + 1) % chapters.length, true);
    else video.currentTime = 0;
  }
});

document.querySelector("#enterExperience").addEventListener("click", () => {
  entered = true;
  entry.hidden = true;
  shell.hidden = false;
  video.muted = false;
  soundToggle.textContent = "Sound on";
  loadChapter(0);
});

retryButton.addEventListener("click", () => {
  status.classList.remove("is-error");
  retryButton.hidden = true;
  statusText.textContent = "Loading scene…";
  video.load();
  video.play().catch(() => undefined);
});

soundToggle.addEventListener("click", () => {
  video.muted = !video.muted;
  soundToggle.textContent = video.muted ? "Sound off" : "Sound on";
});

document.querySelector("#playToggle").addEventListener("click", togglePlayback);
document.querySelector("#nextScene").addEventListener("click", () => loadChapter((activeChapter + 1) % chapters.length));
document.querySelector("#panelClose").addEventListener("click", () => closePanel());
document.querySelectorAll("[data-open-drawer]").forEach((button) => button.addEventListener("click", openDrawer));
document.querySelectorAll("[data-close-drawer]").forEach((button) => button.addEventListener("click", closeDrawer));
document.querySelectorAll("[data-open-panel]").forEach((button) => {
  button.addEventListener("click", () => openPanel(button.dataset.openPanel));
});
document.querySelectorAll("[data-full-film]").forEach((button) => {
  button.addEventListener("click", () => loadChapter(0, true));
});
document.querySelectorAll("[data-chapter]").forEach((button) => {
  button.addEventListener("click", () => loadChapter(Number(button.dataset.chapter)));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
    closePanel();
  }
  if (!entered || !infoPanel.hidden) return;
  if (event.key === "ArrowRight") loadChapter((activeChapter + 1) % chapters.length);
  if (event.key === "ArrowLeft") loadChapter((activeChapter - 1 + chapters.length) % chapters.length);
  if (event.key === " ") {
    event.preventDefault();
    togglePlayback();
  }
});
