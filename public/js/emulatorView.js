import { CONSOLE_CORES, EXTENSION_CORES } from "./state.js";
import { getIcon } from "./icons.js";

export const FEATURED_CLASSICS = [
  {
    title: "Super Mario World",
    console: "SNES",
    url: "https://archive.org/download/SNESTOSEC/Super%20Mario%20World%20%28USA%29.zip"
  },
  {
    title: "Pokemon - Emerald Version",
    console: "GBA",
    url: "https://archive.org/download/GameBoyAdvanceTOSEC/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).zip"
  },
  {
    title: "Super Mario 64",
    console: "N64",
    url: "https://archive.org/download/N64TOSEC/Super%20Mario%2064%20(USA).zip"
  },
  {
    title: "Sonic The Hedgehog 2",
    console: "Genesis",
    url: "https://archive.org/download/nointro.md/Sonic%20The%20Hedgehog%202%20(World).7z"
  },
  {
    title: "Super Mario Bros.",
    console: "NES",
    url: "https://archive.org/download/NESTOSEC/Super%20Mario%20Bros.%20(World).zip"
  },
  {
    title: "Pokemon - Red Version",
    console: "GB",
    url: "https://archive.org/download/GameBoyTOSEC/Pokemon%20-%20Red%20Version%20(USA%2C%20Europe)%20(SGB%20Enhanced).zip"
  },
  {
    title: "Pokemon - Crystal Version",
    console: "GBC",
    url: "https://archive.org/download/GameBoyColorTOSEC/Pokemon%20-%20Crystal%20Version%20(USA%2C%20Europe)%20(Rev%20A).zip"
  },
  {
    title: "Castlevania: Symphony of the Night",
    console: "PS1",
    url: "https://archive.org/download/psx-treyner-pbp/PBP%2FCastlevania%20-%20Symphony%20Of%20The%20Night.PBP"
  },
  {
    title: "Mario Kart DS",
    console: "NDS",
    url: "https://archive.org/download/6108-pokemon-version-blanche-2-f-frie-nds/0168%20-%20Mario%20Kart%20DS%20(U)(SCZ).nds"
  }
];

export function initEmulatorView() {
  const container = document.getElementById("classicsGrid");
  if (container) {
    container.innerHTML = FEATURED_CLASSICS.map(g => `
      <div class="port-card fade-in">
        <div>
          <span class="badge-console">${g.console}</span>
          <h3 style="font-size: 15px; font-weight: 700; margin: 10px 0 4px;">${g.title}</h3>
          <p style="font-size: 12px; color: var(--text-dim);">Emulação WebAssembly nativa em 60 FPS.</p>
        </div>
        <button class="btn-action btn-play" style="width: 100%; justify-content: center;" onclick="window.playRomWeb('${encodeURIComponent(g.url)}', '${g.console}', '${encodeURIComponent(g.title)}')">
          ${getIcon("play")} Jogar Agora
        </button>
      </div>
    `).join("");
  }

  const localFile = document.getElementById("localRomInput");
  if (localFile) {
    localFile.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        const coreSelect = document.getElementById("localCoreSelect");
        const core = coreSelect ? coreSelect.value : "gba";
        launchWebEmulator(fileUrl, core, file.name, true);
      }
    };
  }
}

export function launchWebEmulator(gameUrl, platformOrCore, title, isLocal = false) {
  const modal = document.getElementById("theaterModal");
  const modalTitle = document.getElementById("theaterTitle");
  const modalBody = document.getElementById("theaterBody");
  const coreBadge = document.getElementById("theaterBadge");

  if (!modal || !modalBody) return;

  const ext = gameUrl.split(".").pop().toLowerCase().split("?")[0];
  const core = CONSOLE_CORES[platformOrCore] || EXTENSION_CORES[ext] || platformOrCore.toLowerCase();

  if (modalTitle) modalTitle.textContent = title;
  if (coreBadge) coreBadge.textContent = (platformOrCore || core).toUpperCase();

  // Loading state
  modalBody.innerHTML = `
    <div id="emulator-loader-box" class="emulator-status-box">
      <div class="spinner"></div>
      <div class="status-msg">Carregando núcleo WebAssembly e baixando ROM...</div>
      <div class="status-sub">Pressione Esc a qualquer momento para sair</div>
    </div>
    <div id="game-frame" style="width:100%;height:100%;"></div>
  `;
  modal.classList.add("active");

  // Roteamento através do proxy para quebrar bloqueio de CORS do Archive.org
  const resolvedGameUrl = (isLocal || gameUrl.startsWith("blob:") || gameUrl.startsWith("data:"))
    ? gameUrl
    : `/api/proxy?url=${encodeURIComponent(gameUrl)}`;

  window.EJS_player = "#game-frame";
  window.EJS_core = core;
  window.EJS_gameUrl = resolvedGameUrl;
  window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
  window.EJS_startOnLoaded = true;

  window.EJS_onGameStart = () => {
    const loader = document.getElementById("emulator-loader-box");
    if (loader) loader.style.display = "none";
  };

  const script = document.createElement("script");
  script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
  script.onerror = () => renderEmulatorError(modalBody, gameUrl, platformOrCore, title);
  modalBody.appendChild(script);

  // Timeout de segurança se o core travar
  setTimeout(() => {
    const loader = document.getElementById("emulator-loader-box");
    if (loader && loader.style.display !== "none") {
      const canvas = document.querySelector("#game-frame canvas");
      if (!canvas) renderEmulatorError(modalBody, gameUrl, platformOrCore, title);
    }
  }, 12000);
}

function renderEmulatorError(container, url, consoleName, title) {
  container.innerHTML = `
    <div class="emulator-status-box error-state">
      <div style="font-size: 24px; color: #ef4444; margin-bottom: 8px;">Falha ao Iniciar Emulador</div>
      <p style="color: var(--text-dim); max-width: 480px; font-size: 14px; margin-bottom: 20px;">
        Não foi possível carregar a ROM no navegador. O servidor de origem pode ter bloqueado o stream ou este arquivo precisa ser rodado localmente.
      </p>
      <div style="display: flex; gap: 10px;">
        <button class="btn-action btn-play" onclick="window.playRomWeb('${encodeURIComponent(url)}', '${consoleName}', '${encodeURIComponent(title)}')">
          ${getIcon("refresh")} Tentar Novamente
        </button>
        <a class="btn-action btn-download" href="${url}" download target="_blank" rel="noopener">
          ${getIcon("download")} Baixar ROM
        </a>
      </div>
    </div>
  `;
}
