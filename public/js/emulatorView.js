import { CONSOLE_CORES, EXTENSION_CORES } from "./state.js";
import { getIcon } from "./icons.js";

export const FEATURED_CLASSICS = [
  {
    title: "Super Mario World",
    console: "SNES",
    url: "/roms/super-mario-world.sfc"
  },
  {
    title: "Pokemon - Emerald Version",
    console: "GBA",
    url: "/roms/pokemon-emerald.gba"
  },
  {
    title: "Super Mario 64",
    console: "N64",
    url: "/roms/super-mario-64.z64"
  },
  {
    title: "Sonic The Hedgehog 2",
    console: "Genesis",
    url: "/roms/sonic-2.md"
  },
  {
    title: "Super Mario Bros.",
    console: "NES",
    url: "/roms/super-mario-bros.nes"
  },
  {
    title: "Pokemon - Red Version",
    console: "GB",
    url: "/roms/pokemon-red.gb"
  },
  {
    title: "Pokemon - Crystal Version",
    console: "GBC",
    url: "/roms/pokemon-crystal.gbc"
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

  const serverWrap = document.getElementById("theaterServerWrap");
  if (serverWrap) serverWrap.style.display = "none";

  const runnerUrl = `/emulator.html?core=${encodeURIComponent(core)}&gameUrl=${encodeURIComponent(gameUrl)}`;

  modalBody.innerHTML = `
    <iframe id="emulator-runner-frame" src="${runnerUrl}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen; gamepad; focus-without-user-activation *" allowfullscreen></iframe>
  `;
  modal.classList.add("active");
}
