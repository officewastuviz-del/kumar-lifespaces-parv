const chapters = [
  { label: "Grand Arrival", kicker: "01 / Arrival", src: "public/clip-grand-arrival.mp4", duration: 13.5 },
  { label: "Outdoor Play", kicker: "02 / Active Life", src: "public/clip-outdoor-play.mp4", duration: 14 },
  { label: "Indoor Pool", kicker: "03 / Recreation", src: "public/clip-indoor-pool.mp4", duration: 6.5 },
  { label: "The Lobby", kicker: "04 / Welcome", src: "public/clip-lobby.mp4", duration: 18 },
  { label: "Fitness", kicker: "05 / Movement", src: "public/clip-fitness.mp4", duration: 9 },
  { label: "Indoor Games", kicker: "06 / Togetherness", src: "public/clip-indoor-games.mp4", duration: 9 },
  { label: "Wellness", kicker: "07 / Calm", src: "public/clip-wellness.mp4", duration: 16 },
  { label: "Day Care", kicker: "08 / Little Worlds", src: "public/clip-day-care.mp4", duration: 5 },
  { label: "Outdoor Decks", kicker: "09 / Open Skies", src: "public/clip-outdoor-decks.mp4", duration: 11 },
  { label: "Signature Tower", kicker: "10 / Parv", src: "public/clip-signature-tower.mp4", duration: 10 },
];

const navigation = [
  { label: "Location", detail: "Moshi · Pune", children: [{ label: "Actual Google Map", action: "map" }] },
  { label: "Flat Options", detail: "2 & 3 BHK", children: [{ label: "View Residences", action: "residences" }] },
  {
    label: "Amenities",
    detail: "Life at Parv",
    children: chapters.map((chapter, index) => ({ label: chapter.label, chapter: index })),
  },
  { label: "Project", detail: "Overview & RERA", children: [{ label: "Project Details", action: "project" }] },
  { label: "Full Film", detail: "Cinematic Tour", action: "film" },
];

const app = document.querySelector("#app");
const video = document.querySelector("#hero-video");
const entryScreen = document.querySelector("#entry-screen");
const entryPrompt = document.querySelector("#entry-prompt");
const introAnimation = document.querySelector("#intro-animation");
const locationList = document.querySelector("#location-list");
const chapterTitle = document.querySelector("#chapter-title");
const chapterKicker = document.querySelector("#chapter-kicker");
const chapterMain = document.querySelector("#chapter-main");
const chapterDetail = document.querySelector("#chapter-detail");
const floorLabel = document.querySelector("#floor-label");
const planToggleLabel = document.querySelector("#plan-toggle-label");
const stateLabel = document.querySelector("#state-label");
const stateDot = document.querySelector("#state-dot");
const soundButton = document.querySelector("#sound-button");
const playButton = document.querySelector("#play-button");
const status = document.querySelector("#video-status");
const statusText = document.querySelector("#video-status-text");
const retryVideo = document.querySelector("#retry-video");
const scenePlan = document.querySelector("#scene-plan");

let entered = false;
let activeChapter = 0;
let filmMode = false;
let planVisible = false;
let chapterTimer;

function setState(label) {
  stateLabel.textContent = label;
  stateDot.classList.toggle("active", label === "PLAYING");
  app.classList.toggle("is-playing", label === "PLAYING");
}

function updateSceneUI() {
  const chapter = chapters[activeChapter];
  floorLabel.textContent = chapter.label;
  planToggleLabel.textContent = chapter.label;
  chapterKicker.textContent = filmMode ? "GUIDED FILM" : chapter.kicker.toUpperCase();
  chapterMain.textContent = filmMode ? "THE PARV FILM" : chapter.label.toUpperCase();
  chapterDetail.textContent = "Kumar Lifespaces Parv · Moshi";
  chapterTitle.hidden = false;
  window.clearTimeout(chapterTimer);
  chapterTimer = window.setTimeout(() => {
    chapterTitle.hidden = true;
  }, 2400);
  scenePlan.querySelectorAll("button").forEach((button, index) => {
    button.classList.toggle("active", index === activeChapter);
  });
  locationList.querySelectorAll("[data-chapter]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.chapter) === activeChapter);
  });
}

function loadChapter(index, guided = false) {
  activeChapter = index;
  filmMode = guided;
  status.hidden = false;
  status.classList.remove("error");
  statusText.textContent = "LOADING SCENE";
  retryVideo.hidden = true;
  video.src = chapters[index].src;
  video.load();
  video.play().then(() => setState("PLAYING")).catch(() => setState("READY"));
  updateSceneUI();
}

function openDialog(id) {
  video.pause();
  setState("PAUSED");
  document.querySelector(`#${id}-dialog`).showModal();
}

function closeDialogs() {
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
  if (entered) video.play().then(() => setState("PLAYING")).catch(() => setState("READY"));
}

function buildNavigation() {
  navigation.forEach((item, navIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "nav-item nav-level-0";
    const parent = document.createElement("button");
    parent.className = "nav-action nav-parent";
    parent.innerHTML = `<span class="nav-copy"><strong>${item.label}</strong><small>${item.detail}</small></span><span class="arrow">${item.children ? "+" : "↗"}</span>`;
    wrapper.appendChild(parent);

    if (item.children) {
      const children = document.createElement("div");
      children.className = "nav-children";
      item.children.forEach((child) => {
        const button = document.createElement("button");
        button.className = "nav-action nav-leaf";
        button.innerHTML = `<span class="nav-copy"><strong>${child.label}</strong></span><span class="arrow">↗</span>`;
        if (typeof child.chapter === "number") {
          button.dataset.chapter = String(child.chapter);
          button.addEventListener("click", () => loadChapter(child.chapter));
        } else {
          button.addEventListener("click", () => openDialog(child.action));
        }
        children.appendChild(button);
      });
      wrapper.appendChild(children);
      parent.addEventListener("click", () => {
        document.querySelectorAll(".nav-item.open").forEach((openItem) => {
          if (openItem !== wrapper) openItem.classList.remove("open");
        });
        wrapper.classList.toggle("open");
      });
    } else {
      parent.addEventListener("click", () => loadChapter(0, true));
    }
    wrapper.dataset.navIndex = String(navIndex);
    locationList.appendChild(wrapper);
  });
}

function buildScenePlan() {
  chapters.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", chapter.label);
    button.innerHTML = `<i></i><span>${String(index + 1).padStart(2, "0")}</span>`;
    button.addEventListener("click", () => loadChapter(index));
    scenePlan.appendChild(button);
  });
}

video.addEventListener("loadstart", () => {
  status.hidden = false;
  statusText.textContent = "LOADING SCENE";
});

video.addEventListener("canplay", () => {
  status.hidden = true;
  video.play().then(() => setState(entered ? "PLAYING" : "IDLE")).catch(() => setState("READY"));
});

video.addEventListener("error", () => {
  status.hidden = false;
  status.classList.add("error");
  statusText.textContent = "VIDEO COULD NOT START";
  retryVideo.hidden = false;
  setState("ERROR");
});

video.addEventListener("timeupdate", () => {
  if (!entered) {
    if (video.currentTime >= 10.5) video.currentTime = 0;
    return;
  }
  const duration = chapters[activeChapter].duration;
  if (video.currentTime >= duration - 0.08) {
    if (filmMode) loadChapter((activeChapter + 1) % chapters.length, true);
    else video.currentTime = 0;
  }
});

document.querySelector("#enter-button").addEventListener("click", () => {
  entryPrompt.hidden = true;
  introAnimation.hidden = false;
  video.muted = false;
  window.setTimeout(() => {
    entered = true;
    entryScreen.hidden = true;
    app.setAttribute("aria-busy", "false");
    loadChapter(0);
  }, 1050);
});

document.querySelector("#plan-toggle").addEventListener("click", () => undefined);

document.querySelector("#menu-toggle").addEventListener("click", () => {
  app.classList.toggle("menu-open");
  document.querySelector("#menu-toggle").setAttribute("aria-expanded", String(app.classList.contains("menu-open")));
});

soundButton.addEventListener("click", () => {
  video.muted = !video.muted;
  soundButton.textContent = video.muted ? "MUSIC OFF" : "MUSIC ON";
  soundButton.classList.toggle("active", !video.muted);
});

document.querySelector("#volume-slider").addEventListener("input", (event) => {
  video.volume = Number(event.target.value);
  if (video.volume > 0 && video.muted) {
    video.muted = false;
    soundButton.textContent = "MUSIC ON";
    soundButton.classList.add("active");
  }
});

playButton.addEventListener("click", () => {
  playButton.classList.toggle("active");
  playButton.setAttribute("aria-pressed", String(playButton.classList.contains("active")));
});

document.querySelector("#full-film-button").addEventListener("click", () => loadChapter(0, true));
document.querySelector("#fullscreen-button").addEventListener("click", () => {
  if (!document.fullscreenElement) app.requestFullscreen?.();
  else document.exitFullscreen?.();
});
document.querySelector("#rera-trigger").addEventListener("click", () => openDialog("project"));
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeDialogs));
retryVideo.addEventListener("click", () => {
  video.load();
  video.play().catch(() => undefined);
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialogs();
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDialogs();
  if (!entered || document.querySelector("dialog[open]")) return;
  if (event.key === "ArrowRight") loadChapter((activeChapter + 1) % chapters.length);
  if (event.key === "ArrowLeft") loadChapter((activeChapter - 1 + chapters.length) % chapters.length);
  if (event.key === " ") {
    event.preventDefault();
    playButton.click();
  }
});

buildNavigation();
buildScenePlan();
video.volume = 0.75;
document.querySelector(".floor-panel").hidden = !planVisible;
app.classList.remove("plan-open");
