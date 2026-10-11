import { CONSOLE_CORES, EXTENSION_CORES } from "./state.js";
import { getIcon } from "./icons.js";
import { addRecentGame } from "./favoritesService.js";

export const FEATURED_CLASSICS = [
  { title: "Super Mario World", console: "SNES", url: "/roms/super-mario-world.sfc" },
  { title: "Pokemon - Emerald Version", console: "GBA", url: "/roms/pokemon-emerald.gba" },
  { title: "Super Mario 64", console: "N64", url: "/roms/super-mario-64.z64" },
  { title: "Sonic The Hedgehog 2", console: "Genesis", url: "/roms/sonic-2.md" },
  { title: "Super Mario Bros.", console: "NES", url: "/roms/super-mario-bros.nes" },
  { title: "Pokemon - Red Version", console: "GB", url: "/roms/pokemon-red.gb" },
  { title: "Pokemon - Crystal Version", console: "GBC", url: "/roms/pokemon-crystal.gbc" }
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

    renderTechnicalNotice(container);
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

function renderTechnicalNotice(container) {
  const notice = document.createElement("div");
  notice.className = "technical-info-card fade-in";
  notice.style.gridColumn = "1 / -1";
  notice.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <h3 style="font-size:14px;font-weight:700;color:#f4f4f6;">Arquitetura: PS2, Wii U e Nintendo Switch</h3>
    </div>
    <p style="font-size:13px;color:var(--text-dim);line-height:1.6;margin-bottom:12px;">
      Estes consoles exigem recompilação JIT de 64-bits, drivers Vulkan de hardware e 8GB+ de RAM física que o sandbox WebAssembly não suporta para jogos comerciais na web. Suas ROMs e ISOs completas estão prontas para baixar na aba ROMs, compatíveis com os emuladores oficiais abaixo:
    </p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="https://pcsx2.net/" target="_blank" rel="noopener" class="chip">🔗 PCSX2 (PS2)</a>
      <a href="https://cemu.info/" target="_blank" rel="noopener" class="chip">🔗 Cemu (Wii U)</a>
      <a href="https://sudachi.emuplace.app/" target="_blank" rel="noopener" class="chip">🔗 Sudachi / Ryujinx (Switch)</a>
    </div>
  `;
  container.appendChild(notice);
}

export function launchWebEmulator(gameUrl, platformOrCore, title, isLocal = false) {
  const modal = document.getElementById("theaterModal");
  const modalTitle = document.getElementById("theaterTitle");
  const modalBody = document.getElementById("theaterBody");
  const coreBadge = document.getElementById("theaterBadge");
  const serverWrap = document.getElementById("theaterServerWrap");

  if (!modal || !modalBody) return;

  const ext = gameUrl.split(".").pop().toLowerCase().split("?")[0];
  const core = CONSOLE_CORES[platformOrCore] || EXTENSION_CORES[ext] || platformOrCore.toLowerCase();

  addRecentGame({ id: title, title, type: "emulator", console: (platformOrCore || core).toUpperCase(), url: gameUrl });

  if (modalTitle) modalTitle.textContent = title;
  if (coreBadge) coreBadge.textContent = (platformOrCore || core).toUpperCase();
  if (serverWrap) serverWrap.style.display = "none";

  const runnerUrl = `/emulator.html?core=${encodeURIComponent(core)}&gameUrl=${encodeURIComponent(gameUrl)}`;
  modalBody.innerHTML = `
    <iframe id="emulator-runner-frame" src="${runnerUrl}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen; gamepad; focus-without-user-activation *" allowfullscreen></iframe>
  `;
  modal.classList.add("active");
}
