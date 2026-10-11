import { getRecentGames } from "./favoritesService.js";
import { openTheaterGame } from "./theaterModal.js";
import { launchWebEmulator } from "./emulatorView.js";

export function renderRecentGames() {
  const section = document.getElementById("recentGamesSection");
  const grid = document.getElementById("recentGrid");
  if (!section || !grid) return;

  const recents = getRecentGames();
  if (!recents || recents.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  grid.innerHTML = recents.map((g, idx) => {
    const isRom = g.type === "rom" || g.type === "emulator";
    const badge = isRom ? (g.console || "ROM") : "PORT";
    const cover = g.cover || "./covers/default.jpg";
    return `
      <div class="recent-card" data-idx="${idx}">
        <img src="${cover}" alt="${g.title}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" onerror="this.src='./covers/default.jpg'">
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 11px; font-family: var(--font-mono); color: var(--violet-light); font-weight: 700;">${badge}</div>
          <div style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-bright);">${g.title}</div>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".recent-card").forEach((card) => {
    card.onclick = () => {
      const idx = parseInt(card.dataset.idx, 10);
      const item = recents[idx];
      if (!item) return;
      if (item.type === "rom" || item.type === "emulator") {
        launchWebEmulator(item.url, item.console, item.title);
      } else {
        openTheaterGame(item.url, item.title);
      }
    };
  });
}
