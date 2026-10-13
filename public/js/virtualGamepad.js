// Modern Virtual Xbox Controller for Mobile & Touch Screens
const KEY_MAP = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  a: "x",        // SNES / GBA Button A
  b: "z",        // Button B
  x: "s",        // Button X
  y: "a",        // Button Y
  lb: "q",       // L Shoulder
  rb: "w",       // R Shoulder
  select: "Shift",
  start: "Enter"
};

export function initVirtualGamepad(targetWindow = window) {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  createHudMarkup();

  const container = document.getElementById("xboxHudContainer");
  if (!container) return;

  // Mostra automaticamente se for dispositivo touch/mobile
  if (!isTouch && window.innerWidth > 900) {
    container.classList.add("hidden");
  }

  const sendKey = (key, type) => {
    const e = new KeyboardEvent(type, {
      key,
      code: key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight" ? key : `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true
    });
    targetWindow.document.dispatchEvent(e);
  };

  container.querySelectorAll("[data-btn]").forEach(btn => {
    const action = btn.dataset.btn;
    const mapped = KEY_MAP[action];
    if (!mapped) return;

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add("pressed");
      if (navigator.vibrate) navigator.vibrate(12);
      sendKey(mapped, "keydown");
    };

    const end = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.remove("pressed");
      sendKey(mapped, "keyup");
    };

    btn.addEventListener("touchstart", start, { passive: false });
    btn.addEventListener("touchend", end, { passive: false });
    btn.addEventListener("mousedown", start);
    btn.addEventListener("mouseup", end);
    btn.addEventListener("mouseleave", end);
  });
}

function createHudMarkup() {
  if (document.getElementById("xboxHudContainer")) return;
  const div = document.createElement("div");
  div.id = "xboxHudContainer";
  div.className = "xbox-hud-container";
  div.innerHTML = `
    <div class="xbox-top-bar">
      <button class="xbox-trigger-btn" data-btn="lb">LB</button>
      <div class="xbox-center-controls">
        <button class="xbox-pill-btn" data-btn="select">VIEW</button>
        <button class="xbox-pill-btn" data-btn="start">MENU</button>
      </div>
      <button class="xbox-trigger-btn" data-btn="rb">RB</button>
    </div>
    <div class="xbox-bottom-bar">
      <div class="xbox-dpad-wrap">
        <button class="xbox-dpad-btn xbox-dpad-up" data-btn="up">▲</button>
        <button class="xbox-dpad-btn xbox-dpad-left" data-btn="left">◀</button>
        <div class="xbox-dpad-center"></div>
        <button class="xbox-dpad-btn xbox-dpad-right" data-btn="right">▶</button>
        <button class="xbox-dpad-btn xbox-dpad-down" data-btn="down">▼</button>
      </div>
      <div class="xbox-abxy-wrap">
        <button class="xbox-action-btn xbox-btn-y" data-btn="y">Y</button>
        <button class="xbox-action-btn xbox-btn-x" data-btn="x">X</button>
        <button class="xbox-action-btn xbox-btn-b" data-btn="b">B</button>
        <button class="xbox-action-btn xbox-btn-a" data-btn="a">A</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}
