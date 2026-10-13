// HUD de carregamento universal com barra de progresso para jogos e portas web
export function createGameLoader(parentEl, { title = "Carregando Jogo", platform = "CONSOLE", cover = null } = {}) {
  const existing = parentEl.querySelector(".console-game-loader");
  if (existing) existing.remove();

  const loader = document.createElement("div");
  loader.className = "console-game-loader";
  loader.innerHTML = `
    <div class="loader-backdrop" ${cover ? `style="background-image: url('${cover}')"` : ""}></div>
    <div class="loader-content">
      <div class="loader-badge">${platform}</div>
      <h2 class="loader-title">${title}</h2>
      
      <div class="loader-progress-box">
        <div class="loader-bar-track">
          <div class="loader-bar-fill" id="gameLoaderBar"></div>
        </div>
        <div class="loader-meta">
          <span class="loader-status" id="gameLoaderStatus">Inicializando recursos...</span>
          <span class="loader-pct" id="gameLoaderPct">0%</span>
        </div>
      </div>
    </div>
  `;

  parentEl.appendChild(loader);

  const bar = loader.querySelector("#gameLoaderBar");
  const status = loader.querySelector("#gameLoaderStatus");
  const pct = loader.querySelector("#gameLoaderPct");

  return {
    update(percentage, text) {
      const p = Math.max(0, Math.min(100, Math.round(percentage)));
      if (bar) bar.style.width = `${p}%`;
      if (pct) pct.textContent = `${p}%`;
      if (status && text) status.textContent = text;
    },
    complete() {
      if (bar) bar.style.width = "100%";
      if (pct) pct.textContent = "100%";
      if (status) status.textContent = "Pronto para jogar!";
      loader.classList.add("fade-out");
      setTimeout(() => loader.remove(), 400);
    },
    remove() {
      loader.remove();
    }
  };
}
