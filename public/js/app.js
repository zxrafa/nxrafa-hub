import { state } from "./state.js";
import { initCloak } from "./cloak.js";
import { loadRomStats, loadRomsData } from "./romService.js";
import { initRomsView, renderRomsList } from "./romsView.js";
import { initEmulatorView } from "./emulatorView.js";
import { initPortsView } from "./portsView.js";
import { initGamepadDetection } from "./gamepadService.js";
import { exportBackup, importBackup } from "./favoritesService.js";
import { renderRecentGames } from "./recentsView.js";

async function init() {
  initCloak();
  initTabs();
  initModalControls();
  initGamepadDetection();
  initBackupControls();

  initRomsView();
  initEmulatorView();
  initPortsView();
  renderRecentGames();

  const stats = await loadRomStats();
  updateHomeStats(stats);

  await loadRomsData();
  renderRomsList();
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.onclick = () => {
      const target = btn.dataset.tab;
      switchTab(target);
    };
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
  if (tabName === "home") renderRecentGames();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.goToTab = switchTab;

function initBackupControls() {
  const backupBtn = document.getElementById("backupBtn");
  const backupInput = document.getElementById("backupInput");
  if (!backupBtn || !backupInput) return;

  backupBtn.onclick = () => {
    const choice = confirm("Exportar ou Restaurar backup?\n\nClique OK para EXPORTAR (baixar arquivo .json) ou CANCELAR para IMPORTAR.");
    if (choice) {
      exportBackup();
    } else {
      backupInput.click();
    }
  };

  backupInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await importBackup(file);
      alert("Backup restaurado com sucesso! Recarregando página...");
      location.reload();
    }
  };
}

function updateHomeStats(stats) {
  const totalRomsEl = document.getElementById("statTotalRoms");
  const totalConsolesEl = document.getElementById("statTotalConsoles");

  if (totalRomsEl && stats.All) {
    totalRomsEl.textContent = stats.All.toLocaleString("pt-BR");
  }
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
    renderRecentGames();
  };

  if (closeBtn) closeBtn.onclick = closeModal;

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
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
