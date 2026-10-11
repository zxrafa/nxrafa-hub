export function initGamepadDetection() {
  const badge = document.getElementById("gamepadBadge");

  const updateStatus = (connected, name = "") => {
    if (!badge) return;
    if (connected) {
      badge.style.display = "inline-flex";
      badge.title = `Controle detectado: ${name}`;
      badge.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/>
          <line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/>
          <rect width="20" height="12" x="2" y="6" rx="6"/>
        </svg>
        <span>Controle Ativo</span>
      `;
    } else {
      badge.style.display = "none";
    }
  };

  window.addEventListener("gamepadconnected", (e) => {
    updateStatus(true, e.gamepad.id);
  });

  window.addEventListener("gamepaddisconnected", () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const active = Array.from(pads).find(p => p !== null);
    if (active) {
      updateStatus(true, active.id);
    } else {
      updateStatus(false);
    }
  });

  // Initial check
  if (navigator.getGamepads) {
    const pads = navigator.getGamepads();
    const active = Array.from(pads).find(p => p !== null);
    if (active) updateStatus(true, active.id);
  }
}
