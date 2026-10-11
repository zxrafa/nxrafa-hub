import { state } from "./state.js";

const ORIGINAL_TITLE = "nxrafa hub — Acervo de Jogos, ROMs e Emuladores";
const DRIVE_FAVICON = "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";
const ORIGINAL_FAVICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="%2308080a"/><circle cx="50" cy="50" r="22" fill="%238b5cf6"/></svg>';

export function initCloak() {
  const cloakBtn = document.getElementById("cloakBtn");
  const panicBtn = document.getElementById("panicBtn");

  if (cloakBtn) cloakBtn.onclick = toggleCloak;
  if (panicBtn) panicBtn.onclick = triggerPanic;

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
