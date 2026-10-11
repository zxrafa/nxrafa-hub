import { state } from "./state.js";
import { getIcon } from "./icons.js";

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
    const count = cat === "Todos" ? state.webports.length : (counts[cat] || 0);
    const badge = chip.querySelector(".chip-badge");
    if (badge) badge.textContent = count;
  });
}

export function applyPortFilters() {
  const query = state.activePortSearch.trim().toLowerCase();
  const cat = state.activePortCat;

  state.filteredPorts = state.webports.filter((p) => {
    const matchCat = cat === "Todos" || (p.categories && p.categories.includes(cat));
    const matchQuery = !query || p.title.toLowerCase().includes(query) || (p.desc && p.desc.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });
}

export function renderPortsList() {
  const container = document.getElementById("portsGridContainer");
  const countEl = document.getElementById("portsCountText");

  if (!container) return;

  if (countEl) {
    countEl.textContent = `${state.filteredPorts.length} jogos disponíveis`;
  }

  if (state.filteredPorts.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-dim);">Nenhum jogo encontrado nesta categoria.</div>`;
    return;
  }

  container.innerHTML = state.filteredPorts.map((p) => {
    const initial = p.title.slice(0, 2).toUpperCase();
    const isExternal = !!p.openExternal;

    return `
      <div class="port-card fade-in">
        <div class="port-card-cover-wrap">
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
        ${isExternal ? `
          <a class="btn-action btn-external" href="${p.url}" target="_blank" rel="noopener">
            ${getIcon("external")} Abrir em Nova Aba
          </a>
        ` : `
          <button class="btn-action btn-play" onclick="window.launchPortIframe('${encodeURIComponent(p.url)}', '${encodeURIComponent(p.title)}')">
            ${getIcon("play")} Jogar no Navegador
          </button>
        `}
      </div>
    `;
  }).join("");
}

window.launchPortIframe = (encodedUrl, encodedTitle) => {
  const url = decodeURIComponent(encodedUrl);
  const title = decodeURIComponent(encodedTitle);

  const modal = document.getElementById("theaterModal");
  const modalTitle = document.getElementById("theaterTitle");
  const modalBody = document.getElementById("theaterBody");
  const coreBadge = document.getElementById("theaterBadge");

  if (!modal || !modalBody) return;

  if (modalTitle) modalTitle.textContent = title;
  if (coreBadge) coreBadge.textContent = "WEB PORT";

  modalBody.innerHTML = `
    <iframe src="${url}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen; gamepad; pointer-lock *" allowfullscreen></iframe>
  `;

  modal.classList.add("active");
};
