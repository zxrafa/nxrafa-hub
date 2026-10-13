// Console Control Center (Quick Settings & Audio Mixer estilo PS5/Xbox)
import { setMasterVolume, getMasterVolume, toggleConsoleSound, isSoundEnabled } from "./audioService.js";
import { toggleAmbient, isAmbientActive, startAmbient } from "./ambientAudio.js";

let drawer = null;

export function initControlCenter() {
  drawer = document.getElementById("consoleControlCenter");
  const triggerBtn = document.getElementById("controlCenterBtn");
  const closeBtn = document.getElementById("ccCloseBtn");
  if (!drawer) return;

  if (triggerBtn) triggerBtn.onclick = () => toggleControlCenter();
  if (closeBtn) closeBtn.onclick = () => closeControlCenter();

  // Volume Mestre Slider
  const volSlider = document.getElementById("ccMasterVol");
  if (volSlider) {
    volSlider.value = Math.round(getMasterVolume() * 100);
    volSlider.oninput = (e) => setMasterVolume(parseInt(e.target.value, 10) / 100);
  }

  // Som Ambiente Toggle
  const ambientSwitch = document.getElementById("ccAmbientSwitch");
  if (ambientSwitch) {
    ambientSwitch.classList.toggle("active", isAmbientActive());
    ambientSwitch.onclick = () => {
      const active = toggleAmbient();
      ambientSwitch.classList.toggle("active", active);
    };
  }

  // Efeitos Sonoros de Navegação Toggle
  const sfxSwitch = document.getElementById("ccSfxSwitch");
  if (sfxSwitch) {
    sfxSwitch.classList.toggle("active", isSoundEnabled());
    sfxSwitch.onclick = () => {
      const active = toggleConsoleSound();
      sfxSwitch.classList.toggle("active", active);
    };
  }

  // Tela Cheia Toggle
  const fsBtn = document.getElementById("ccFullscreenBtn");
  if (fsBtn) {
    fsBtn.onclick = () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    };
  }

  // Atualizar estatísticas de sistema
  updateSystemStats();
  setInterval(updateSystemStats, 3000);
}

export function openControlCenter() {
  if (drawer) {
    drawer.classList.add("active");
    startAmbient(); // Inicia áudio ambiente caso ainda não esteja rodando
  }
}

export function closeControlCenter() {
  if (drawer) drawer.classList.remove("active");
}

export function toggleControlCenter() {
  if (drawer?.classList.contains("active")) closeControlCenter();
  else openControlCenter();
}

function updateSystemStats() {
  const fpsEl = document.getElementById("ccStatFps");
  const padsEl = document.getElementById("ccStatPads");
  if (fpsEl) fpsEl.textContent = "60 FPS";
  if (padsEl) {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p !== null) : [];
    padsEl.textContent = pads.length > 0 ? `${pads.length} Conectado` : "Nenhum";
  }
}
