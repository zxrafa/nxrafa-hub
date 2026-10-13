// Spotlight Search Minimalista (Ctrl+K / Busca Universal estilo PS5)
import { state } from "./state.js";
import { FEATURED_CLASSICS } from "./emulatorView.js";
import { launchGame } from "./consoleSpotlight.js";
import { playNavTick, playSelectSound } from "./audioService.js";

let modal = null;
let input = null;
let resultsList = null;
let filteredItems = [];
let selectedIndex = 0;

export function initSpotlightSearch() {
  modal = document.getElementById("spotlightSearchModal");
  input = document.getElementById("spotlightSearchInput");
  resultsList = document.getElementById("spotlightResultsList");
  if (!modal || !input || !resultsList) return;

  const triggerBtn = document.getElementById("spotlightSearchBtn");
  if (triggerBtn) triggerBtn.onclick = () => openSpotlight();

  modal.onclick = (e) => {
    if (e.target === modal) closeSpotlight();
  };

  input.oninput = () => handleSearch(input.value.trim());

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      toggleSpotlight();
    } else if (e.key === "Escape" && modal.classList.contains("active")) {
      e.preventDefault();
      closeSpotlight();
    } else if (modal.classList.contains("active")) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        changeSelection(selectedIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        changeSelection(selectedIndex - 1);
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        const target = filteredItems[selectedIndex];
        closeSpotlight();
        launchGame(target);
      }
    }
  });
}

export function openSpotlight() {
  if (!modal || !input) return;
  modal.classList.add("active");
  input.value = "";
  handleSearch("");
  setTimeout(() => input.focus(), 60);
}

export function closeSpotlight() {
  if (modal) modal.classList.remove("active");
}

export function toggleSpotlight() {
  if (modal?.classList.contains("active")) closeSpotlight();
  else openSpotlight();
}

function getAllSearchableGames() {
  const ports = (state.webports || []).map(p => ({ ...p, type: "port" }));
  const classics = FEATURED_CLASSICS.map(c => ({
    id: `classic-${c.console}-${c.title}`,
    title: c.title,
    desc: `Emulador ${c.console}`,
    cover: `/covers/${c.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`,
    url: c.url,
    console: c.console,
    type: "emulator"
  }));
  return [...ports, ...classics];
}

function handleSearch(query) {
  const all = getAllSearchableGames();
  const q = query.toLowerCase();
  filteredItems = q
    ? all.filter(g => g.title.toLowerCase().includes(q) || (g.console && g.console.toLowerCase().includes(q))).slice(0, 12)
    : all.slice(0, 8);

  selectedIndex = 0;
  renderResults();
}

function renderResults() {
  if (!resultsList) return;
  if (filteredItems.length === 0) {
    resultsList.innerHTML = `<div class="spotlight-empty">Nenhum jogo encontrado com esse termo.</div>`;
    return;
  }
  resultsList.innerHTML = filteredItems.map((item, idx) => {
    const isSel = idx === selectedIndex;
    const tag = item.type === "emulator" ? item.console : "WEB PORT";
    const cover = item.cover || "./covers/default.jpg";
    return `
      <div class="spotlight-item ${isSel ? 'selected' : ''}" data-idx="${idx}">
        <img class="spotlight-thumb" src="${cover}" alt="${item.title}" onerror="this.src='./covers/default.jpg'">
        <div class="spotlight-meta">
          <div class="spotlight-item-title">${item.title}</div>
          <span class="spotlight-item-tag">${tag}</span>
        </div>
      </div>
    `;
  }).join("");

  resultsList.querySelectorAll(".spotlight-item").forEach(el => {
    el.onclick = () => {
      const idx = parseInt(el.dataset.idx, 10);
      const target = filteredItems[idx];
      closeSpotlight();
      launchGame(target);
    };
  });
}

function changeSelection(newIdx) {
  if (filteredItems.length === 0) return;
  if (newIdx < 0) newIdx = filteredItems.length - 1;
  if (newIdx >= filteredItems.length) newIdx = 0;
  selectedIndex = newIdx;
  playNavTick();
  renderResults();
  const selEl = resultsList.querySelector(`.spotlight-item.selected`);
  selEl?.scrollIntoView({ block: "nearest" });
}
