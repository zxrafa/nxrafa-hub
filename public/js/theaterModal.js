import { createGameLoader } from "./gameLoader.js";
import { pauseAmbientForGame, resumeAmbientAfterGame } from "./ambientAudio.js";

export function openTheaterGame(url, title, sources = null, selectedIdx = 0, cover = null) {
  const modal = document.getElementById("theaterModal");
  const modalTitle = document.getElementById("theaterTitle");
  const modalBody = document.getElementById("theaterBody");
  const coreBadge = document.getElementById("theaterBadge");
  const serverWrap = document.getElementById("theaterServerWrap");
  const serverSelect = document.getElementById("theaterServerSelect");

  if (!modal || !modalBody) return;
  pauseAmbientForGame();

  if (modalTitle) modalTitle.textContent = title;
  if (coreBadge) coreBadge.textContent = "WEB PORT";

  if (serverWrap && serverSelect) {
    if (sources && sources.length > 1) {
      serverSelect.innerHTML = sources.map((s, idx) =>
        `<option value="${idx}" ${idx === selectedIdx ? "selected" : ""}>${s.name}</option>`
      ).join("");
      serverWrap.style.display = "flex";
      serverSelect.onchange = (e) => {
        const nextUrl = sources[parseInt(e.target.value, 10)]?.url;
        if (nextUrl) openTheaterGame(nextUrl, title, sources, parseInt(e.target.value, 10), cover);
      };
    } else {
      serverWrap.style.display = "none";
    }
  }

  modalBody.innerHTML = `
    <iframe id="theaterFrame" src="${url}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen; gamepad; pointer-lock *" allowfullscreen></iframe>
  `;
  modal.classList.add("active");

  const loader = createGameLoader(modalBody, { title, platform: "WEB PORT", cover });
  loader.update(15, "Conectando ao servidor...");

  const t1 = setTimeout(() => loader.update(45, "Alocando memória WebAssembly..."), 500);
  const t2 = setTimeout(() => loader.update(80, "Sincronizando assets e shaders..."), 1200);

  const iframe = modalBody.querySelector("#theaterFrame");
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(t1);
    clearTimeout(t2);
    loader.update(100, "Pronto para jogar!");
    setTimeout(() => loader.complete(), 280);
  };

  if (iframe) iframe.onload = finish;
  setTimeout(finish, 3200);
}

export function closeTheater() {
  const modal = document.getElementById("theaterModal");
  const modalBody = document.getElementById("theaterBody");
  if (modal) modal.classList.remove("active");
  if (modalBody) modalBody.innerHTML = "";
  resumeAmbientAfterGame();
}
