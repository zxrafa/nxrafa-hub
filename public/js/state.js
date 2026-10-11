export const state = {
  activeTab: "home",
  activeConsole: "all",
  activeRegion: "all",
  activeSearch: "",
  activePortCat: "all",
  activePortSearch: "",
  
  allRoms: [],
  filteredRoms: [],
  displayedRoms: [],
  
  romPage: 1,
  romPageSize: 48,
  
  stats: {},
  webports: [],
  filterPorts: [],
  
  isCloaked: false
};

export const CONSOLE_CORES = {
  GBA: "gba",
  SNES: "snes",
  NES: "nes",
  N64: "n64",
  Genesis: "segaMD",
  GB: "gb",
  GBC: "gbc",
  PS1: "psx",
  NDS: "nds"
};

export const REGION_FLAGS = {
  USA: "🇺🇸",
  Europe: "🇪🇺",
  Japan: "🇯🇵",
  Brazil: "🇧🇷",
  World: "🌐",
  Global: "🌐"
};
