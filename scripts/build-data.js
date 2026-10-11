import fs from "fs";
import path from "path";

function parseRegion(filename) {
  const upper = filename.toUpperCase();
  if (upper.includes("(USA") || upper.includes("(U)") || upper.includes("(US)")) return "USA";
  if (upper.includes("(EUROPE") || upper.includes("(E)") || upper.includes("(EUR)") || upper.includes("(FRANCE") || upper.includes("(GERMANY") || upper.includes("(SPAIN") || upper.includes("(ITALY")) return "Europe";
  if (upper.includes("(JAPAN") || upper.includes("(J)") || upper.includes("(JP)")) return "Japan";
  if (upper.includes("(BRAZIL") || upper.includes("(BR)") || upper.includes("PT-BR")) return "Brazil";
  if (upper.includes("(WORLD") || upper.includes("(W)")) return "World";
  return "Global";
}

function cleanTitle(name) {
  let title = name.replace(/\.(zip|7z|smc|sfc|nes|z64|bin|md|nds|iso|pbp|rvz|wbfs)$/i, "");
  title = title.replace(/\s*\([^)]*\)/g, "").replace(/\s*\[[^\]]*\]/g, "").trim();
  return title || name;
}

function formatSize(bytes) {
  const b = parseInt(bytes, 10) || 0;
  if (b >= 1024 * 1024 * 1024) return (b / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  if (b >= 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + " MB";
  if (b >= 1024) return (b / 1024).toFixed(0) + " KB";
  return b + " B";
}

async function fetchArchiveCollection(id, consoleName, extList) {
  const list = [];
  try {
    const res = await fetch(`https://archive.org/metadata/${id}/files`);
    const data = await res.json();
    const files = data.result || [];
    for (const f of files) {
      if (!f.name || f.name.startsWith("_") || f.name.endsWith(".xml") || f.name.endsWith(".sqlite") || f.name.endsWith(".torrent") || f.name.endsWith(".txt")) continue;
      const lower = f.name.toLowerCase();
      if (!extList.some(ext => lower.endsWith(ext))) continue;

      const downloadUrl = `https://archive.org/download/${id}/${encodeURIComponent(f.name)}`;
      list.push({
        id: `${consoleName.toLowerCase()}-${list.length + 1}`,
        title: cleanTitle(f.name),
        file: f.name,
        console: consoleName,
        region: parseRegion(f.name),
        size: formatSize(f.size),
        bytes: parseInt(f.size, 10) || 0,
        url: downloadUrl
      });
    }
  } catch (e) {
    console.error(`Erro ao buscar ${id}:`, e.message);
  }
  return list;
}

async function buildAll() {
  console.log("1. Carregando ROMs base...");
  const basePath = path.resolve("public/data/roms-base.json");
  const rawBase = JSON.parse(fs.readFileSync(basePath, "utf-8"));
  
  const allRoms = rawBase.map(r => ({
    ...r,
    region: parseRegion(r.file || r.title)
  }));

  console.log(`Base carregada com ${allRoms.length} ROMs.`);

  console.log("2. Buscando coleções extras verificadas (GameCube, Wii)...");
  const gc1 = await fetchArchiveCollection("retroachievements-gamecube-complete-collection", "GameCube", [".rvz", ".iso", ".7z"]);
  const gc2 = await fetchArchiveCollection("GameCube_rvz-english", "GameCube", [".rvz"]);
  const wii = await fetchArchiveCollection("Wii_ISO", "Wii", [".wbfs", ".iso", ".7z", ".rvz"]);

  const seenUrls = new Set(allRoms.map(r => r.url));
  let addedExtra = 0;
  for (const item of [...gc1, ...gc2, ...wii]) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      allRoms.push(item);
      addedExtra++;
    }
  }
  console.log(`Adicionadas ${addedExtra} ROMs extras (GameCube e Wii). Total ROMs: ${allRoms.length}`);

  // Estatísticas por console
  const stats = { All: allRoms.length };
  for (const r of allRoms) {
    stats[r.console] = (stats[r.console] || 0) + 1;
  }

  // 3. Processar Web Game Ports
  console.log("3. Processando catálogo de Web Game Ports...");
  const carterFile = "C:/Users/MANCER/temp-ports-carter/README.md";
  const inxanityFile = "C:/Users/MANCER/discord-terminal-bot/public/games.json";
  
  const webports = [];
  const seenPortUrls = new Set();

  if (fs.existsSync(inxanityFile)) {
    const inxGames = JSON.parse(fs.readFileSync(inxanityFile, "utf-8"));
    for (const g of inxGames) {
      const url = g.mirrors && g.mirrors[0] ? g.mirrors[0].url : "";
      if (url && !seenPortUrls.has(url)) {
        seenPortUrls.add(url);
        webports.push({
          id: `inx-${g.id}`,
          title: g.title,
          category: g.category || "Populares",
          rating: 4.8,
          thumb: g.thumbnail || "",
          url: url,
          source: "Inxanity Unblocked"
        });
      }
    }
  }

  if (fs.existsSync(carterFile)) {
    const content = fs.readFileSync(carterFile, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const match = line.match(/\|\s*\d+\s*\|\s*([^|]+)\|\s*\[▶ Play\]\(([^)]+)\)\s*\|\s*([^|]*)\|/);
      if (match) {
        const title = match[1].trim();
        const url = match[2].trim();
        if (url && !seenPortUrls.has(url)) {
          seenPortUrls.add(url);
          webports.push({
            id: `carter-${webports.length + 1}`,
            title: title,
            category: "Web Ports WASM",
            rating: 4.7,
            thumb: "",
            url: url,
            source: "WebAssembly Port"
          });
        }
      }
    }
  }

  console.log(`Total Web Game Ports: ${webports.length}`);

  // 4. Salvar arquivos organizados
  console.log("4. Salvando arquivos finais...");
  fs.writeFileSync("public/data/roms.json", JSON.stringify(allRoms));
  fs.writeFileSync("public/data/roms-stats.json", JSON.stringify(stats));
  fs.writeFileSync("public/data/webports.json", JSON.stringify(webports));

  console.log("CONCLUÍDO COM SUCESSO!");
  console.log("Estatísticas:", stats);
}

buildAll().catch(console.error);
