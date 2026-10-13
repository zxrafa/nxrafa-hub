import { state } from "./state.js";
import { FEATURED_CLASSICS } from "./emulatorView.js";
import { playNavTick } from "./audioService.js";
import { updateSpotlight, launchGame } from "./consoleSpotlight.js";
import { isFavorite } from "./favoritesService.js";
import { initCarouselFilters } from "./carouselFilter.js";

let selectedIdx = 0;
let allLibraryGames = [];
let spotlightGames = [];

export function initConsoleView() {
  initClock();
  setupConsoleLibrary();
  initConsoleNavigation();
  initCarouselFilters(applyCarouselFilter);
}

function initClock() {
  const clockEl = document.getElementById("consoleClock");
  if (!clockEl) return;
  const update = () => {
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  update();
  setInterval(update, 1000);
}

export function setupConsoleLibrary() {
  const ports = state.webports || [];
  const topPorts = ports.slice(0, 18);
  const classics = FEATURED_CLASSICS.map(c => ({
    id: `classic-${c.console}-${c.title}`,
    title: c.title,
    desc: `Emulação Libretro 60 FPS nativa para ${c.console}.`,
    cover: `/covers/${c.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`,
    url: c.url,
    console: c.console,
    type: "emulator",
    rating: 4.9,
    categories: ["Retrô", c.console]
  }));

  allLibraryGames = [...topPorts, ...classics];
  spotlightGames = [...allLibraryGames];
  if (spotlightGames.length === 0) return;

  renderCarousel();
  updateSpotlight(spotlightGames[0]);
}

function applyCarouselFilter(filter) {
  if (filter === "all") {
    spotlightGames = [...allLibraryGames];
  } else if (filter === "ports") {
    spotlightGames = allLibraryGames.filter(g => g.type !== "emulator");
  } else if (filter === "favs") {
    spotlightGames = allLibraryGames.filter(g => isFavorite(g.id));
    if (spotlightGames.length === 0) spotlightGames = [...allLibraryGames];
  } else {
    spotlightGames = allLibraryGames.filter(g => g.console === filter || g.categories?.includes(filter));
    if (spotlightGames.length === 0) spotlightGames = [...allLibraryGames];
  }
  selectedIdx = 0;
  renderCarousel();
  if (spotlightGames.length > 0) updateSpotlight(spotlightGames[0]);
}

function renderCarousel() {
  const track = document.getElementById("consoleCarouselTrack");
  if (!track || spotlightGames.length === 0) return;

  track.innerHTML = spotlightGames.map((game, i) => {
    const cover = game.cover || "./covers/default.jpg";
    const tag = game.type === "emulator" ? game.console : (game.categories?.[1] || "WEB PORT");
    const isActive = i === selectedIdx;
    return `
      <div class="console-tile ${isActive ? 'active' : ''}" data-idx="${i}" tabindex="0">
        <div class="console-tile-glow"></div>
        <img class="console-tile-img" src="${cover}" alt="${game.title}" loading="lazy" onerror="this.src='./covers/default.jpg'">
        <div class="console-tile-overlay">
          <span class="console-tile-tag">${tag}</span>
          <span class="console-tile-title">${game.title}</span>
        </div>
      </div>
    `;
  }).join("");

  track.querySelectorAll(".console-tile").forEach(tile => {
    tile.onclick = () => {
      const idx = parseInt(tile.dataset.idx, 10);
      if (selectedIdx === idx) {
        launchGame(spotlightGames[idx]);
      } else {
        selectGame(idx);
      }
    };
  });
}

export function selectGame(idx) {
  if (idx < 0 || idx >= spotlightGames.length) return;
  selectedIdx = idx;
  playNavTick();
  updateSpotlight(spotlightGames[selectedIdx]);

  const tiles = document.querySelectorAll(".console-tile");
  tiles.forEach((t, i) => t.classList.toggle("active", i === selectedIdx));

  const activeTile = tiles[selectedIdx];
  if (activeTile) {
    activeTile.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function initConsoleNavigation() {
  const prevBtn = document.getElementById("carouselPrevBtn");
  const nextBtn = document.getElementById("carouselNextBtn");
  if (prevBtn) prevBtn.onclick = () => selectGame(selectedIdx - 1);
  if (nextBtn) nextBtn.onclick = () => selectGame(selectedIdx + 1);

  window.addEventListener("keydown", (e) => {
    const homeTab = document.getElementById("tab-home");
    if (!homeTab || !homeTab.classList.contains("active")) return;
    if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectGame(selectedIdx - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      selectGame(selectedIdx + 1);
    } else if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement?.tagName !== "BUTTON") {
        e.preventDefault();
        launchGame(spotlightGames[selectedIdx]);
      }
    } else if (e.key === "f" || e.key === "F") {
      document.getElementById("spotlightFavBtn")?.click();
    }
  });
}
