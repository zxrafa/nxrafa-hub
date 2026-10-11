const FAV_KEY = "nxrafa_favs_v1";
const RECENT_KEY = "nxrafa_recents_v1";

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isFavorite(id) {
  const favs = getFavorites();
  return favs.some(f => f.id === id);
}

export function toggleFavorite(item) {
  const favs = getFavorites();
  const idx = favs.findIndex(f => f.id === item.id);
  if (idx > -1) {
    favs.splice(idx, 1);
  } else {
    favs.push({
      id: item.id,
      title: item.title,
      type: item.type || "port",
      console: item.console || "",
      cover: item.cover || "",
      url: item.url || ""
    });
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return idx === -1;
}

export function getRecentGames() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentGame(game) {
  if (!game || !game.id) return;
  const recents = getRecentGames().filter(g => g.id !== game.id);
  recents.unshift({
    id: game.id,
    title: game.title,
    type: game.type || "port",
    console: game.console || "",
    cover: game.cover || "",
    url: game.url || "",
    lastPlayed: Date.now()
  });
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 8)));
}

export function exportBackup() {
  const data = {
    favorites: getFavorites(),
    recents: getRecentGames(),
    localStorageDumps: {},
    exportedAt: new Date().toISOString()
  };
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith("ejs_") || k.startsWith("nxrafa_"))) {
      data.localStorageDumps[k] = localStorage.getItem(k);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `nxrafa-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

export async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (data.favorites) localStorage.setItem(FAV_KEY, JSON.stringify(data.favorites));
  if (data.recents) localStorage.setItem(RECENT_KEY, JSON.stringify(data.recents));
  if (data.localStorageDumps) {
    for (const [k, v] of Object.entries(data.localStorageDumps)) {
      localStorage.setItem(k, v);
    }
  }
}
