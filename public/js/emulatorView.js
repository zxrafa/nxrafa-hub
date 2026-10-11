import { CONSOLE_CORES } from "./state.js";

export const FEATURED_CLASSICS = [
  {
    title: "Super Mario World",
    console: "SNES",
    url: "https://archive.org/download/SNESTOSEC/Super%20Mario%20World%20%28USA%29.zip"
  },
  {
    title: "Pokemon Emerald",
    console: "GBA",
    url: "https://archive.org/download/GameBoyAdvanceTOSEC/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).zip"
  },
  {
    title: "Super Mario 64",
    console: "N64",
    url: "https://archive.org/download/N64TOSEC/Super%20Mario%2064%20(USA).zip"
  },
  {
    title: "The Legend of Zelda: Ocarina of Time",
    console: "N64",
    url: "https://archive.org/download/N64TOSEC/Legend%20of%20Zelda%2C%20The%20-%20Ocarina%20of%20Time%20(USA).zip"
  },
  {
    title: "Sonic The Hedgehog 2",
    console: "Genesis",
    url: "https://archive.org/download/nointro.md/Sonic%20The%20Hedgehog%202%20(World).7z"
  },
  {
    title: "Castlevania: Symphony of the Night",
    console: "PS1",
    url: "https://archive.org/download/psx-treyner-pbp/Castlevania%20-%20SOTN.pbp"
  }
];

export function initEmulatorView() {
  const container = document.getElementById("classicsGrid");
  if (container) {
    container.innerHTML = FEATURED_CLASSICS.map(g => `
      <div class="port-card fade-in" style="border-color: rgba(168,85,247,0.2);">
        <div>
          <span class="chip-badge" style="background: rgba(168,85,247,0.15); color: var(--purple-accent); padding: 3px 8px; border-radius: 6px; font-weight: 700;">
            ${g.console}
          </span>
          <h3 style="font-size: 16px; font-weight: 700; margin: 10px 0 4px;">${g.title}</h3>
          <p style="font-size: 13px; color: var(--text-dim);">Emulação WebAssembly sem download prévio.</p>
        </div>
        <button class="btn-action btn-play" style="width: 100%; justify-content: center;" onclick="window.playRomWeb('${encodeURIComponent(g.url)}', '${g.console}', '${encodeURIComponent(g.title)}')">
          ▶ Jogar Agora
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
        launchWebEmulator(fileUrl, core, file.name);
      }
    };
  }
}

export function launchWebEmulator(gameUrl, consoleName, title) {
  const modal = document.getElementById("theaterModal");
  const modalTitle = document.getElementById("theaterTitle");
  const modalBody = document.getElementById("theaterBody");
  const coreBadge = document.getElementById("theaterBadge");

  if (!modal || !modalBody) return;

  const core = CONSOLE_CORES[consoleName] || consoleName.toLowerCase();
  if (modalTitle) modalTitle.textContent = title;
  if (coreBadge) coreBadge.textContent = consoleName.toUpperCase();

  modalBody.innerHTML = `
    <div style="width:100%;height:100%;max-width:100%;background:#000;">
      <div id="game-frame" style="width:100%;height:100%;"></div>
    </div>
  `;

  modal.classList.add("active");

  window.EJS_player = "#game-frame";
  window.EJS_core = core;
  window.EJS_gameUrl = gameUrl;
  window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
  window.EJS_startOnLoaded = true;

  const script = document.createElement("script");
  script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
  modalBody.appendChild(script);
}
