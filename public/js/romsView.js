import { state, CONSOLE_CORES, EXTENSION_CORES, REGION_NAMES } from "./state.js";
import { applyRomFilters, loadNextRomPage } from "./romService.js";
import { launchWebEmulator } from "./emulatorView.js";
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

    return `
      <div class="rom-item fade-in">
        <div class="rom-info-left">
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

window.playRomWeb = (encodedUrl, consoleName, encodedTitle) => {
  const url = decodeURIComponent(encodedUrl);
  const title = decodeURIComponent(encodedTitle);
  launchWebEmulator(url, consoleName, title);
};
