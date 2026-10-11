import { state } from "./state.js";

const ORIGINAL_TITLE = document.title;
const DRIVE_FAVICON = "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";
const ORIGINAL_FAVICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🟣</text></svg>';

export function initCloak() {
  const cloakBtn = document.getElementById("cloakBtn");
  const panicBtn = document.getElementById("panicBtn");

  if (cloakBtn) {
    cloakBtn.onclick = toggleCloak;
  }

  if (panicBtn) {
    panicBtn.onclick = triggerPanic;
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("theaterModal");
      if (modal && modal.classList.contains("active")) {
        modal.classList.remove("active");
        const body = document.getElementById("theaterBody");
        if (body) body.innerHTML = "";
      } else {
        triggerPanic();
      }
    }
  });
}

export function toggleCloak() {
  state.isCloaked = !state.isCloaked;
  const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";

  if (state.isCloaked) {
    document.title = "Meu Drive - Google Drive";
    link.href = DRIVE_FAVICON;
    document.head.appendChild(link);
  } else {
    document.title = ORIGINAL_TITLE;
    link.href = ORIGINAL_FAVICON;
    document.head.appendChild(link);
  }
}

export function triggerPanic() {
  window.location.replace("https://classroom.google.com");
}
