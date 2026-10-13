// Gerenciador de filtros de plataforma do carrossel estilo console (L1/R1)
import { playNavTick } from "./audioService.js";

const FILTERS = ["all", "ports", "SNES", "GBA", "N64", "Genesis", "favs"];
let activeIdx = 0;
let onFilterChangeCb = null;

export function initCarouselFilters(onChange) {
  onFilterChangeCb = onChange;
  const bar = document.getElementById("carouselFilterBar");
  if (!bar) return;

  bar.querySelectorAll(".console-filter-pill").forEach((pill, idx) => {
    pill.onclick = () => selectFilterByIndex(idx);
  });

  window.addEventListener("keydown", (e) => {
    const homeTab = document.getElementById("tab-home");
    if (!homeTab || !homeTab.classList.contains("active")) return;
    if (document.activeElement?.tagName === "INPUT") return;

    if (e.key === "q" || e.key === "Q") {
      e.preventDefault();
      prevFilter();
    } else if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      nextFilter();
    }
  });
}

export function selectFilterByIndex(idx) {
  if (idx < 0) idx = FILTERS.length - 1;
  if (idx >= FILTERS.length) idx = 0;
  activeIdx = idx;
  const filter = FILTERS[activeIdx];

  const pills = document.querySelectorAll(".console-filter-pill");
  pills.forEach((p, i) => p.classList.toggle("active", i === activeIdx));

  playNavTick();
  if (onFilterChangeCb) onFilterChangeCb(filter);
}

export function prevFilter() {
  selectFilterByIndex(activeIdx - 1);
}

export function nextFilter() {
  selectFilterByIndex(activeIdx + 1);
}
