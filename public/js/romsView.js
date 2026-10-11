import { state, CONSOLE_CORES, EXTENSION_CORES, REGION_NAMES } from "./state.js";
import { applyRomFilters, loadNextRomPage } from "./romService.js";
import { launchWebEmulator } from "./emulatorView.js";
import { isFavorite, toggleFavorite, addRecentGame } from "./favoritesService.js";
import { getIcon } from "./icons.js";

export function initRomsView() {
  const searchInput = document.getElementById("romSearch");
  if (searchInput) {
    let debounce;
    searchInput.oninput = (e) => {
      clearTimeout(debounce);
      state.activeSearch = e.target.value;
      debounce = setTimeout(() => {
        applyRomFilters();
        renderRomsList();
      }, 160);
    };
  }

  const regionSelect = document.getElementById("regionSelect");
  if (regionSelect) {
    regionSelect.onchange = (e) => {
      state.activeRegion = e.target.value;
      applyRomFilters();
      renderRomsList();
    };
  }

  const favToggleBtn = document.getElementById("romFavToggleBtn");
  if (favToggleBtn) {
    favToggleBtn.onclick = () => {
      state.romOnlyFavorites = !state.romOnlyFavorites;
      favToggleBtn.classList.toggle("active", state.romOnlyFavorites);
      applyRomFilters();
      renderRomsList();
    };
  }

  document.querySelectorAll(".rom-console-chip").forEach((chip) => {
    chip.onclick = () => {
      document.querySelectorAll(".rom-console-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.activeConsole = chip.dataset.console;
      applyRomFilters();
      renderRomsList();
    };
  });

  const loadMoreBtn = document.getElementById("romsLoadMore");
  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      if (loadNextRomPage()) renderRomsList();
    };
  }
}

export function isEmulatorCompatible(rom) {
  if (CONSOLE_CORES[rom.console]) return true;
  const ext = (rom.file || rom.url || "").split(".").pop().toLowerCase();
  return !!EXTENSION_CORES[ext];
}

export function renderRomsList() {
  const container = document.getElementById("romsListContainer");
  const countEl = document.getElementById("romsCountText");
  const loadMoreBtn = document.getElementById("romsLoadMore");

  if (!container) return;

  if (countEl) {
    countEl.textContent = `${state.displayedRoms.length.toLocaleString("pt-BR")} de ${state.filteredRoms.length.toLocaleString("pt-BR")} ROMs`;
  }

  if (state.displayedRoms.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 48px; color: var(--text-dim);">Nenhuma ROM encontrada para esta busca.</div>`;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  container.innerHTML = state.displayedRoms.map((r) => {
    const regionName = REGION_NAMES[r.region] || r.region;
    const canPlay = isEmulatorCompatible(r);
    const fav = isFavorite(r.id);

    return `
      <div class="rom-item fade-in">
        <div class="rom-info-left">
          <button class="btn-fav-rom ${fav ? 'active' : ''}" onclick="window.toggleFavRom('${r.id}', event)" title="Favoritar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
          <span class="badge-console">${r.console}</span>
          <div style="min-width: 0;">
            <div class="rom-title-text" title="${r.title}">${r.title}</div>
            <div class="rom-meta-tag">
              <span class="region-pill">${regionName}</span>
              <span>•</span>
              <span>${r.size}</span>
            </div>
          </div>
        </div>
        <div class="btn-group">
          ${canPlay ? `
            <button class="btn-action btn-play" onclick="window.playRomWeb('${encodeURIComponent(r.url)}', '${r.console}', '${encodeURIComponent(r.title)}')">
              ${getIcon("play")} Jogar Web
            </button>
          ` : `
            <span class="badge-unsupported" title="Sem emulador compatível no navegador para este sistema">
              Apenas Download
            </span>
          `}
          <a class="btn-action btn-download" href="${r.url}" download target="_blank" rel="noopener">
            ${getIcon("download")} Baixar
          </a>
        </div>
      </div>
    `;
  }).join("");

  if (loadMoreBtn) {
    const hasMore = state.displayedRoms.length < state.filteredRoms.length;
    loadMoreBtn.style.display = hasMore ? "block" : "none";
  }
}

window.toggleFavRom = (romId, e) => {
  e.stopPropagation();
  const r = state.allRoms.find(x => x.id === romId);
  if (!r) return;
  toggleFavorite({ id: r.id, title: r.title, type: "rom", console: r.console, url: r.url });
  if (state.romOnlyFavorites) applyRomFilters();
  renderRomsList();
};

window.playRomWeb = (encodedUrl, consoleName, encodedTitle) => {
  const url = decodeURIComponent(encodedUrl);
  const title = decodeURIComponent(encodedTitle);
  addRecentGame({ id: title, title, type: "rom", console: consoleName, url });
  launchWebEmulator(url, consoleName, title);
};
