import { state } from "./state.js";

export async function initPortsView() {
  try {
    const res = await fetch("./data/webports.json");
    state.webports = await res.json();
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

export function applyPortFilters() {
  const query = state.activePortSearch.trim().toLowerCase();
  const cat = state.activePortCat;

  state.filterPorts = state.webports.filter((p) => {
    const matchCat = cat === "all" || p.category.toLowerCase().includes(cat.toLowerCase()) || p.source.toLowerCase().includes(cat.toLowerCase());
    const matchQuery = !query || p.title.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });
}

export function renderPortsList() {
  const container = document.getElementById("portsGridContainer");
  const countEl = document.getElementById("portsCountText");

  if (!container) return;

  if (countEl) {
    countEl.textContent = `${state.filterPorts.length} jogos disponíveis`;
  }

  if (state.filterPorts.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-dim);">Nenhum jogo webportado encontrado.</div>`;
    return;
  }

  container.innerHTML = state.filterPorts.map((p) => `
    <div class="port-card fade-in">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span class="chip-badge" style="background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 6px; font-weight: 600;">
            ${p.source}
          </span>
          <span style="font-size: 12px; color: #fbbf24; font-weight: 700;">★ ${p.rating}</span>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${p.title}</h3>
        <p style="font-size: 12px; color: var(--text-dim);">${p.category}</p>
      </div>
      <button class="btn-action btn-play" style="width: 100%; justify-content: center;" onclick="window.launchPortIframe('${encodeURIComponent(p.url)}', '${encodeURIComponent(p.title)}')">
        ▶ Jogar no Navegador
      </button>
    </div>
  `).join("");
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
    <iframe src="${url}" allow="autoplay; fullscreen; gamepad; focus-without-user-activation *" allowfullscreen></iframe>
  `;

  modal.classList.add("active");
};
