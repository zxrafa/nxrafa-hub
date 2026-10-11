export const state = {
  activeTab: "home",
  activeConsole: "all",
  activeRegion: "all",
  activeSearch: "",
  
  activePortCat: "Todos",
  activePortSearch: "",
  
  allRoms: [],
  filteredRoms: [],
  displayedRoms: [],
  romPage: 1,
  romPageSize: 48,
  
  stats: {},
  webports: [],
  filteredPorts: [],
  
  isCloaked: false
};

export const CONSOLE_CORES = {
  SNES: "snes",
  GBA: "gba",
  NES: "nes",
  Genesis: "segaMD",
  GB: "gb",
  GBC: "gbc",
  N64: "n64",
  PS1: "psx",
  NDS: "nds"
};

export const EXTENSION_CORES = {
  smc: "snes",
  sfc: "snes",
  gba: "gba",
  nes: "nes",
  gen: "segaMD",
  md: "segaMD",
  smd: "segaMD",
  gb: "gb",
  gbc: "gbc",
  z64: "n64",
  n64: "n64",
  v64: "n64",
  pbp: "psx",
  nds: "nds"
};

export const REGION_NAMES = {
  USA: "USA",
  Europe: "Europa",
  Japan: "Japão",
  Brazil: "Brasil",
  World: "Global",
  Global: "Global"
};
