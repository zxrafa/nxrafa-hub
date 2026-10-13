import { playBootChime } from "./audioService.js";

let hasBootedInSession = false;

export function initBootScreen() {
  const overlay = document.getElementById("consoleBootOverlay");
  const skipBtn = document.getElementById("bootSkipBtn");
  if (!overlay) return;

  const triggerBoot = () => {
    overlay.classList.add("booting");
    overlay.classList.remove("boot-hidden");
    
    // Dispara som harmônico de boot
    setTimeout(() => {
      playBootChime();
    }, 150);

    // Fade-out automático
    const timer = setTimeout(() => {
      dismissBoot();
    }, 2400);

    overlay.onclick = () => {
      clearTimeout(timer);
      dismissBoot();
    };
  };

  const dismissBoot = () => {
    overlay.classList.add("boot-fade-out");
    setTimeout(() => {
      overlay.classList.remove("booting", "boot-fade-out");
      overlay.classList.add("boot-hidden");
      hasBootedInSession = true;
    }, 450);
  };

  if (skipBtn) {
    skipBtn.onclick = (e) => {
      e.stopPropagation();
      dismissBoot();
    };
  }

  window.addEventListener("keydown", (e) => {
    if (overlay.classList.contains("booting") && (e.key === "Enter" || e.key === " " || e.key === "Escape")) {
      dismissBoot();
    }
  }, { once: true });

  // Executa o boot na inicialização
  triggerBoot();
}

export function replayConsoleBoot() {
  const overlay = document.getElementById("consoleBootOverlay");
  if (!overlay) return;
  overlay.classList.remove("boot-hidden", "boot-fade-out");
  initBootScreen();
}

window.replayConsoleBoot = replayConsoleBoot;
