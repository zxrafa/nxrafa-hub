import { state } from "./state.js";
import { initCloak } from "./cloak.js";
import { loadRomStats, loadRomsData } from "./romService.js";
import { initRomsView, renderRomsList } from "./romsView.js";
import { initEmulatorView } from "./emulatorView.js";
import { initPortsView } from "./portsView.js";
import { initGamepadDetection } from "./gamepadService.js";
import { renderRecentGames } from "./recentsView.js";
import { initBootScreen } from "./bootService.js";
import { initConsoleView, setupConsoleLibrary } from "./consoleView.js";
import { initSpotlightSearch } from "./searchService.js";
import { initControlCenter } from "./controlCenter.js";
import { startAmbient, resumeAmbientAfterGame, pauseAmbientForGame } from "./ambientAudio.js";

async function init() {
  initBootScreen();
  initCloak();
  initTabs();
  initModalControls();
  initGamepadDetection();
  initSpotlightSearch();
  initControlCenter();

  // Autoplay compliance: iniciar áudio ambiente no primeiro toque/tecla
  const kickAudio = () => startAmbient();
  window.addEventListener("pointerdown", kickAudio, { once: true });
  window.addEventListener("keydown", kickAudio, { once: true });

  initRomsView();
  initEmulatorView();
  await initPortsView();
  initConsoleView();
  setupConsoleLibrary();
  renderRecentGames();

  const stats = await loadRomStats();
  updateHomeStats(stats);
  await loadRomsData();
  renderRomsList();
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });
}

export function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-content").forEach((c) => {
    c.classList.toggle("active", c.id === `tab-${tabName}`);
  });
  if (tabName === "home") {
    setupConsoleLibrary();
    renderRecentGames();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.goToTab = switchTab;

function updateHomeStats(stats) {
  const totalRomsEl = document.getElementById("statTotalRoms");
  const totalConsolesEl = document.getElementById("statTotalConsoles");
  if (totalRomsEl && stats.All) totalRomsEl.textContent = stats.All.toLocaleString("pt-BR");
  if (totalConsolesEl) {
    const consoleCount = Object.keys(stats).filter(k => k !== "All").length;
    totalConsolesEl.textContent = `${consoleCount}+`;
  }
}

function initModalControls() {
  const modal = document.getElementById("theaterModal");
  const closeBtn = document.getElementById("theaterCloseBtn");
  const fsBtn = document.getElementById("theaterFsBtn");
  const body = document.getElementById("theaterBody");
  const serverWrap = document.getElementById("theaterServerWrap");

  const closeModal = () => {
    if (modal) modal.classList.remove("active");
    if (body) body.innerHTML = "";
    if (serverWrap) serverWrap.style.display = "none";
    resumeAmbientAfterGame();
    renderRecentGames();
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) closeModal();
  });

  if (fsBtn) {
    fsBtn.onclick = () => {
      const box = document.querySelector(".theater-box");
      if (!document.fullscreenElement) {
        if (box) box.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", init);
