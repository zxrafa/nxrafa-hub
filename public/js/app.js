import { state } from "./state.js";
import { initCloak } from "./cloak.js";
import { loadRomStats, loadRomsData } from "./romService.js";
import { initRomsView, renderRomsList } from "./romsView.js";
import { initEmulatorView } from "./emulatorView.js";
import { initPortsView } from "./portsView.js";

async function init() {
  initCloak();
  initTabs();
  initModalControls();

  initRomsView();
  initEmulatorView();
  initPortsView();

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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.goToTab = switchTab;

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

  if (closeBtn && modal) {
    closeBtn.onclick = () => {
      modal.classList.remove("active");
      if (body) body.innerHTML = "";
    };
  }

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
