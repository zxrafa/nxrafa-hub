import fs from "fs";

async function auditAllWebPorts() {
  const inxFile = "C:/Users/MANCER/discord-terminal-bot/public/games.json";
  const carterFile = "C:/Users/MANCER/temp-ports-carter/README.md";

  const allCandidates = [];

  // 1. Inxanity games
  if (fs.existsSync(inxFile)) {
    const inx = JSON.parse(fs.readFileSync(inxFile, "utf-8"));
    for (const g of inx) {
      allCandidates.push({
        source: "Inxanity",
        title: g.title,
        url: g.url,
        cover: g.cover,
        tags: g.tags || [],
        desc: g.desc || g.blurb || ""
      });
    }
  }

  // 2. Carter web ports
  if (fs.existsSync(carterFile)) {
    const content = fs.readFileSync(carterFile, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/\|\s*\d+\s*\|\s*([^|]+)\|\s*\[▶ Play\]\(([^)]+)\)\s*\|\s*([^|]*)\|/);
      if (match) {
        allCandidates.push({
          source: "CarterWASM",
          title: match[1].trim(),
          url: match[2].trim(),
          cover: "",
          tags: ["WebAssembly", "Port"],
          desc: ""
        });
      }
    }
  }

  console.log(`Total de candidatos a auditar: ${allCandidates.length}`);

  const results = {
    working: [],
    broken: []
  };

  // Test in batches of 15
  const batchSize = 15;
  for (let i = 0; i < allCandidates.length; i += batchSize) {
    const batch = allCandidates.slice(i, i + batchSize);
    await Promise.all(batch.map(async (item) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(item.url, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        const xFrame = (res.headers.get("x-frame-options") || "").toLowerCase();
        const csp = (res.headers.get("content-security-policy") || "").toLowerCase();
        const frameBlocked = xFrame === "deny" || xFrame === "sameorigin" || csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'");

        if (res.ok && !frameBlocked) {
          results.working.push({ ...item, status: res.status });
        } else if (res.ok && frameBlocked) {
          results.broken.push({ ...item, reason: `Bloqueado para iframe (X-Frame-Options: ${xFrame || 'CSP'})` });
        } else {
          results.broken.push({ ...item, reason: `HTTP ${res.status}` });
        }
      } catch (err) {
        results.broken.push({ ...item, reason: err.name === "AbortError" ? "Timeout de conexão (>6s)" : err.message });
      }
    }));
    process.stdout.write(`Auditados ${Math.min(i + batchSize, allCandidates.length)} de ${allCandidates.length}...\r`);
  }

  console.log(`\n\n=== RESULTADO DA AUDITORIA ===`);
  console.log(`✓ Funcionando e compatíveis com iframe: ${results.working.length}`);
  console.log(`✗ Quebrados / Bloqueados: ${results.broken.length}`);

  fs.writeFileSync("C:/Users/MANCER/nxrafa-hub/scripts/audit-report.json", JSON.stringify(results, null, 2));
}

auditAllWebPorts().catch(console.error);
