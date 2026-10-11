import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const COVERS_DIR = path.resolve("public/covers");
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

async function downloadImage(url, dest) {
  if (!url || !url.startsWith("http")) return false;
  if (fs.existsSync(dest)) return true;

  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function run() {
  console.log("Iniciando reconstrução do catálogo de Web Ports...");

  const inxPath = "C:/Users/MANCER/discord-terminal-bot/public/games.json";
  const carterPath = "scripts/carter-readme.md";

  const catalog = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  const auditReport = {
    beforeCount: 77,
    inxanityLoaded: 0,
    carterLoaded: 0,
    totalNow: 0,
    openNewTab: [],
    brokenList: []
  };

  // 1. Processar os 77 jogos do Inxanity
  if (fs.existsSync(inxPath)) {
    const inxGames = JSON.parse(fs.readFileSync(inxPath, "utf-8"));
    for (const g of inxGames) {
      const slug = g.slug || slugify(g.title);
      let targetUrl = g.url;
      if (slug === "peak") targetUrl = "/peak.html";
      if (slug === "doom") targetUrl = "/doom.html";
      if (slug === "gta-v") targetUrl = "https://playgta5.site/";

      const coverExt = g.cover && g.cover.endsWith(".webp") ? ".webp" : ".jpg";
      const localCoverRel = `/covers/${slug}${coverExt}`;
      const localCoverAbs = path.join(COVERS_DIR, `${slug}${coverExt}`);

      // Baixar capa local
      if (g.cover) {
        await downloadImage(g.cover, localCoverAbs);
      }

      // Categorias reais
      const tags = (g.tags || []).map(t => t.toLowerCase());
      const categories = ["Todos", "Unblocked"];

      if (g.title.includes("GTA") || tags.includes("open world")) {
        categories.push("Mundo Aberto & RPG", "Populares");
      } else if (tags.includes("fps") || tags.includes("shooter") || tags.includes("multiplayer")) {
        categories.push("Ação & FPS", "Populares");
      } else if (g.title.includes("Zombies") || g.title.includes("Nacht") || g.title.includes("Kino") || tags.includes("horror")) {
        categories.push("Terror & Suspense", "Ação & FPS");
      } else if (tags.includes("classic") || tags.includes("arcade")) {
        categories.push("Clássicos & Sandbox", "Populares");
      } else {
        categories.push("Indie & Sandbox");
      }

      // Embed compatível?
      const isWasmarcade = targetUrl && targetUrl.includes("wasmarcade.com");
      if (isWasmarcade) {
        auditReport.openNewTab.push({
          title: g.title,
          reason: "Usa wasmarcade.com (X-Frame-Options: sameorigin). Configurado para abrir em nova aba limpa."
        });
      }

      catalog.push({
        id: `inx-${slug}`,
        title: g.title,
        slug: slug,
        desc: g.desc || g.blurb || "Jogo webportado completo jogável sem instalação.",
        url: targetUrl,
        embed: !isWasmarcade,
        openExternal: isWasmarcade,
        sources: g.sources || [{ name: "Principal", url: targetUrl }],
        cover: fs.existsSync(localCoverAbs) ? localCoverRel : (g.cover || ""),
        categories: categories,
        rating: 4.8,
        source: "Inxanity Unblocked"
      });

      seenUrls.add(targetUrl);
      seenTitles.add(g.title.toLowerCase().trim());
      auditReport.inxanityLoaded++;
    }
  }

  // 2. Processar jogos válidos de Carter
  if (fs.existsSync(carterPath)) {
    const content = fs.readFileSync(carterPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/\|\s*\d+\s*\|\s*([^|]+)\|\s*\[▶ Play\]\(([^)]+)\)\s*\|\s*([^|]*)\|/);
      if (match) {
        const title = match[1].trim();
        let url = match[2].trim();
        const normTitle = title.toLowerCase().trim();

        if (seenTitles.has(normTitle) || seenUrls.has(url)) continue;

        // Se for link 404 do github.io, descartar e anotar
        if (url.includes("gn-math.github.io/web-port/")) {
          auditReport.brokenList.push({
            title: title,
            url: url,
            reason: "Repositório gn-math.github.io offline (HTTP 404)"
          });
          continue;
        }

        const slug = slugify(title);
        const categories = ["Todos", "WebAssembly (WASM)"];

        const tLower = title.toLowerCase();
        if (tLower.includes("mario") || tLower.includes("sonic") || tLower.includes("climbing") || tLower.includes("brotato")) {
          categories.push("Populares", "Plataforma & Arcade");
        } else if (tLower.includes("freddy") || tLower.includes("nightmare") || tLower.includes("horror")) {
          categories.push("Terror & Suspense");
        } else if (tLower.includes("dawn") || tLower.includes("battle") || tLower.includes("fight")) {
          categories.push("Ação & FPS");
        } else {
          categories.push("Indie & Sandbox");
        }

        catalog.push({
          id: `carter-${slug}`,
          title: title,
          slug: slug,
          desc: `Port oficial em WebAssembly de ${title}.`,
          url: url,
          embed: true,
          openExternal: false,
          sources: [{ name: "WASM Play", url: url }],
          cover: "",
          categories: categories,
          rating: 4.6,
          source: "WASM WebPort"
        });

        seenUrls.add(url);
        seenTitles.add(normTitle);
        auditReport.carterLoaded++;
      }
    }
  }

  auditReport.totalNow = catalog.length;

  fs.writeFileSync("public/data/webports.json", JSON.stringify(catalog, null, 2));
  fs.writeFileSync("scripts/audit-report-final.json", JSON.stringify(auditReport, null, 2));

  console.log("\n=== RELATÓRIO DO CATÁLOGO DE WEBPORTS ===");
  console.log(`Jogos antes: ${auditReport.beforeCount} (Inxanity)`);
  console.log(`Jogos do Inxanity recuperados: ${auditReport.inxanityLoaded}`);
  console.log(`Web ports adicionais ativos (Carter): ${auditReport.carterLoaded}`);
  console.log(`Total agora no catálogo: ${auditReport.totalNow}`);
  console.log(`Jogos com abertura em nova aba (devido a bloqueio de iframe do host): ${auditReport.openNewTab.length}`);
  console.log(`Jogos descartados por 404 (github.io desativado): ${auditReport.brokenList.length}`);
}

run().catch(console.error);
