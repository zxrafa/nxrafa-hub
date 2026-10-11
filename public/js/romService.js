import { state } from "./state.js";

export async function loadRomStats() {
  try {
    const res = await fetch("./data/roms-stats.json?v=2.2");
    state.stats = await res.json();
    return state.stats;
  } catch (err) {
    console.error("Erro stats:", err);
    return {};
  }
}

export async function loadRomsData() {
  try {
    const res = await fetch("./data/roms.json?v=2.2");
    state.allRoms = await res.json();
    applyRomFilters();
    return state.allRoms;
  } catch (err) {
    console.error("Erro roms:", err);
    return [];
  }
}

export function applyRomFilters() {
  const query = state.activeSearch.trim().toLowerCase();
  const cTarget = state.activeConsole.toLowerCase();
  const rTarget = state.activeRegion;

  state.filteredRoms = state.allRoms.filter((item) => {
    const matchConsole = cTarget === "all" || item.console.toLowerCase() === cTarget;
    const matchRegion = rTarget === "all" || item.region === rTarget;
    const matchQuery = !query || 
      item.title.toLowerCase().includes(query) || 
      (item.file && item.file.toLowerCase().includes(query));

    return matchConsole && matchRegion && matchQuery;
  });

  state.romPage = 1;
  state.displayedRoms = state.filteredRoms.slice(0, state.romPageSize);
}

export function loadNextRomPage() {
  const nextStart = state.romPage * state.romPageSize;
  const nextChunk = state.filteredRoms.slice(nextStart, nextStart + state.romPageSize);
  
  if (nextChunk.length > 0) {
    state.romPage++;
    state.displayedRoms = state.displayedRoms.concat(nextChunk);
    return true;
  }
  return false;
}
