import { state } from "./state.js";
import { getIcon } from "./icons.js";
import { openTheaterGame } from "./theaterModal.js";
import { isFavorite, toggleFavorite, addRecentGame, getFavorites } from "./favoritesService.js";

export async function initPortsView() {
  try {
    const res = await fetch("./data/webports.json?v=2.2");
    state.webports = await res.json();
    updateCategoryCounts();
    applyPortFilters();
    renderPortsList();
  } catch (err) {
    console.error("Erro webports:", err);
  }
  const searchInput = document.getElementById("portSearch");
  if (searchInput) {
    let debounce;
    searchInput.oninput = (e) => {
      clearTimeout(debounce);
      state.activePortSearch = e.target.value;
      debounce = setTimeout(() => {
        applyPortFilters();
        renderPortsList();
      }, 160);
    };
  }
  document.querySelectorAll(".port-cat-chip").forEach((chip) => {
    chip.onclick = () => {
      document.querySelectorAll(".port-cat-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.activePortCat = chip.dataset.cat;
      applyPortFilters();
      renderPortsList();
    };
  });
}

function updateCategoryCounts() {
  const counts = {};
  for (const p of state.webports) {
    for (const cat of (p.categories || [])) {
      counts[cat] = (counts[cat] || 0) + 1;
    }
  }
  document.querySelectorAll(".port-cat-chip").forEach((chip) => {
    const cat = chip.dataset.cat;
    let count = counts[cat] || 0;
    if (cat === "Todos") count = state.webports.length;
    if (cat === "Favoritos") count = getFavorites().filter(f => f.type === "port").length;
    const badge = chip.querySelector(".chip-badge");
    if (badge) badge.textContent = count;
  });
}

export function applyPortFilters() {
  const query = state.activePortSearch.trim().toLowerCase();
  const cat = state.activePortCat;

  state.filteredPorts = state.webports.filter((p) => {
    const matchCat = cat === "Todos"
      ? true
      : cat === "Favoritos"
      ? isFavorite(p.id)
      : (p.categories && p.categories.includes(cat));
    const matchQuery = !query || p.title.toLowerCase().includes(query) || (p.desc && p.desc.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });
}

export function renderPortsList() {
  const container = document.getElementById("portsGridContainer");
  const countEl = document.getElementById("portsCountText");
  if (!container) return;

  if (countEl) countEl.textContent = `${state.filteredPorts.length} jogos disponíveis`;
  if (state.filteredPorts.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-dim);">Nenhum jogo encontrado nesta categoria.</div>`;
    return;
  }

  container.innerHTML = state.filteredPorts.map((p) => {
    const initial = p.title.slice(0, 2).toUpperCase();
    const hasMulti = p.sources && p.sources.length > 1;
    const fav = isFavorite(p.id);

    return `
      <div class="port-card fade-in">
        <div class="port-card-cover-wrap">
          <button class="btn-fav ${fav ? 'active' : ''}" onclick="window.toggleFavPort('${p.id}', event)" title="Favoritar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
          ${p.cover ? `
            <img class="port-cover-img" src="${p.cover}" alt="${p.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          ` : ""}
          <div class="port-cover-fallback" style="${p.cover ? 'display: none;' : 'display: flex;'}">
            <span class="fallback-initial">${initial}</span>
            <span class="fallback-tag">${p.source}</span>
          </div>
        </div>
        <div class="port-card-content">
          <div class="port-header-line">
            <span class="badge-tag">${p.categories[1] || p.source}</span>
            <span class="rating-text">★ ${p.rating}</span>
          </div>
          <h3 class="port-title-text" title="${p.title}">${p.title}</h3>
          <p class="port-desc-text">${p.desc}</p>
        </div>
        ${hasMulti ? `
          <div style="margin-bottom: 8px;">
            <label style="font-size: 11px; color: var(--text-dim); display: block; margin-bottom: 4px; font-weight: 600;">Servidor (${p.sources.length} opções):</label>
            <select id="server-select-${p.id}" class="chip" style="width: 100%; outline: none; font-size: 12px; padding: 4px 8px;">
              ${p.sources.map((s, idx) => `<option value="${idx}">${s.name}${s.extra ? ' (' + s.extra + ')' : ''}</option>`).join("")}
            </select>
          </div>
        ` : ""}
        ${p.openExternal ? `
          <a class="btn-action btn-external" href="${p.url}" target="_blank" rel="noopener">
            ${getIcon("external")} Abrir em Nova Aba
          </a>
        ` : `
          <button class="btn-action btn-play" onclick="window.launchPortById('${p.id}')">
            ${getIcon("play")} Jogar no Navegador
          </button>
        `}
      </div>
    `;
  }).join("");
}

window.toggleFavPort = (portId, e) => {
  e.stopPropagation();
  const p = state.webports.find(x => x.id === portId);
  if (!p) return;
  toggleFavorite({ id: p.id, title: p.title, type: "port", cover: p.cover, url: p.url });
  updateCategoryCounts();
  if (state.activePortCat === "Favoritos") applyPortFilters();
  renderPortsList();
};

window.launchPortById = (portId) => {
  const p = state.webports.find(x => x.id === portId);
  if (!p) return;
  addRecentGame({ id: p.id, title: p.title, type: "port", cover: p.cover, url: p.url });
  const sel = document.getElementById(`server-select-${p.id}`);
  const idx = sel ? parseInt(sel.value, 10) : 0;
  const url = (p.sources && p.sources[idx]?.url) || p.url;
  openTheaterGame(url, p.title, p.sources, idx);
};
