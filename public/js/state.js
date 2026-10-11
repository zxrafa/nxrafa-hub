export const state = {
  activeTab: "home",
  activeConsole: "all",
  activeRegion: "all",
  activeSearch: "",
  
  activePortCat: "Todos",
  activePortSearch: "",
  portOnlyFavorites: false,
  romOnlyFavorites: false,
  
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
  GBC: "gb",
  N64: "n64",
  PS1: "psx",
  NDS: "nds",
  PSP: "ppsspp",
  Saturn: "yabause",
  Arcade: "mame2003_plus",
  Atari2600: "stella2014"
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
  gbc: "gb",
  z64: "n64",
  n64: "n64",
  v64: "n64",
  pbp: "psx",
  nds: "nds",
  cso: "ppsspp",
  iso: "ppsspp",
  a26: "stella2014"
};

export const REGION_NAMES = {
  USA: "USA",
  Europe: "Europa",
  Japan: "Japão",
  Brazil: "Brasil",
  World: "Global",
  Global: "Global"
};
