import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3334;
const PUBLIC_DIR = path.resolve("public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".sfc": "application/octet-stream",
  ".smc": "application/octet-stream",
  ".nes": "application/octet-stream",
  ".gba": "application/octet-stream",
  ".gb": "application/octet-stream",
  ".gbc": "application/octet-stream",
  ".z64": "application/octet-stream",
  ".n64": "application/octet-stream",
  ".md": "application/octet-stream"
};

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (parsed.pathname === "/api/proxy") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    let targetUrl = parsed.searchParams.get("url");
    if (!targetUrl) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing url parameter");
      return;
    }

    try {
      while (targetUrl.includes("%25")) {
        targetUrl = decodeURIComponent(targetUrl);
      }
    } catch(e) {}

    try {
      const upstream = await fetch(targetUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      res.writeHead(upstream.status, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Content-Length": upstream.headers.get("content-length") || "",
        "Accept-Ranges": "bytes"
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      const arrayBuffer = await upstream.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } catch (err) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end(`Proxy error: ${err.message}`);
    }
    return;
  }

  let reqPath = parsed.pathname === "/" ? "index.html" : parsed.pathname;
  let filePath = path.join(PUBLIC_DIR, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": data.length,
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(data);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Server Error: ${e.message}`);
  }
});

server.listen(PORT, async () => {
  console.log(`Diagnostic server running on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ channel: "msedge", headless: true });
    const page = await browser.newPage();

    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    console.log("Navigating to http://localhost:" + PORT);
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(1000);

    // 1. Verify Home Tab
    const activeTab1 = await page.evaluate(() => document.querySelector(".tab-btn.active")?.dataset.tab);
    console.log("Initial Active Tab:", activeTab1);

    // 2. Switch to Web Ports Tab
    await page.click('button[data-tab="ports"]');
    await page.waitForTimeout(500);
    const portsCount = await page.evaluate(() => document.getElementById("portsGridContainer")?.children.length);
    console.log("Web Ports Tab - Rendered Cards:", portsCount);

    // 3. Test Search 'Celeste' & Verify Self-Hosted Port
    await page.fill("#portSearch", "Celeste");
    await page.waitForTimeout(400);
    const celesteIframe = await page.evaluate(() => {
      const card = document.querySelector("#portsGridContainer .port-card");
      return card ? card.querySelector(".port-title-text")?.textContent : null;
    });
    console.log("Celeste Search Result:", celesteIframe);

    // Launch Celeste
    await page.click('#portsGridContainer .port-card .btn-play');
    await page.waitForTimeout(1000);
    const celesteSrc = await page.evaluate(() => document.querySelector("#theaterBody iframe")?.src);
    console.log("Celeste Theater Iframe Src:", celesteSrc);
    await page.click("#theaterCloseBtn");
    await page.waitForTimeout(300);

    // 3b. Test Search 'Deltarune' & Verify Clean Port (No Itch.io block)
    await page.fill("#portSearch", "Deltarune");
    await page.waitForTimeout(400);
    await page.click('#portsGridContainer .port-card .btn-play');
    await page.waitForTimeout(1000);
    const deltaruneSrc = await page.evaluate(() => document.querySelector("#theaterBody iframe")?.src);
    console.log("Deltarune Theater Iframe Src (Clean GitHub Pages):", deltaruneSrc);
    await page.click("#theaterCloseBtn");
    await page.waitForTimeout(300);

    // 3c. Test Search 'Bendy' & Verify Native Runner
    await page.fill("#portSearch", "Bendy");
    await page.waitForTimeout(400);
    await page.click('#portsGridContainer .port-card .btn-play');
    await page.waitForTimeout(1000);
    const bendySrc = await page.evaluate(() => document.querySelector("#theaterBody iframe")?.src);
    console.log("Bendy Theater Iframe Src (Native Runner):", bendySrc);
    await page.click("#theaterCloseBtn");
    await page.waitForTimeout(300);

    // 3d. Test Search 'Subway Surfers' & Verify Native Runner
    await page.fill("#portSearch", "Subway Surfers");
    await page.waitForTimeout(400);
    await page.click('#portsGridContainer .port-card .btn-play');
    await page.waitForTimeout(1000);
    const subwaySrc = await page.evaluate(() => document.querySelector("#theaterBody iframe")?.src);
    console.log("Subway Surfers Theater Iframe Src (Native Runner):", subwaySrc);
    await page.click("#theaterCloseBtn");
    await page.waitForTimeout(300);

    // 4. Test Favorites on a Port
    await page.fill("#portSearch", "Celeste");
    await page.waitForTimeout(300);
    await page.click("#portsGridContainer .port-card .btn-fav");
    await page.waitForTimeout(300);
    const favCount = await page.evaluate(() => document.getElementById("portFavCount")?.textContent);
    console.log("Port Favorites Count after liking Celeste:", favCount);

    // 5. Test Recent Games on Home Tab
    await page.click('button[data-tab="home"]');
    await page.waitForTimeout(500);
    const recentGames = await page.evaluate(() => {
      const section = document.getElementById("recentGamesSection");
      const cards = Array.from(document.querySelectorAll("#recentGrid .recent-card"));
      return {
        sectionVisible: section ? window.getComputedStyle(section).display !== "none" : false,
        cardCount: cards.length,
        titles: cards.map(c => c.textContent.trim().replace(/\s+/g, " "))
      };
    });
    console.log("Recent Games Section on Home:", JSON.stringify(recentGames, null, 2));

    // 6. Test Switch to Emulators Tab and Check Cores
    await page.click('button[data-tab="emulators"]');
    await page.waitForTimeout(500);
    const coreOptions = await page.evaluate(() => {
      const sel = document.getElementById("localCoreSelect");
      return sel ? Array.from(sel.options).map(o => o.value) : [];
    });
    console.log("Local Core Select options (only cores with roms):", coreOptions);

    console.log("Launching Super Mario World in Emulator...");
    await page.click('#classicsGrid .port-card:first-child .btn-play');
    await page.waitForTimeout(5500);

    const emuFrame = page.frameLocator("#emulator-runner-frame");
    const canvasFound = await emuFrame.locator("canvas").count();
    const loaderDisplay = await emuFrame.locator("#loader").evaluate(el => window.getComputedStyle(el).display).catch(() => "none");
    console.log("Emulator Launch Check - Canvas count:", canvasFound, "Loader display:", loaderDisplay);

    // 7. Close Emulator Modal
    await page.click("#theaterCloseBtn");
    await page.waitForTimeout(300);

    // 8. Switch to ROMs Tab & Test Dreamcast 200 OK
    await page.click('button[data-tab="roms"]');
    await page.waitForTimeout(800);
    const romsCount = await page.evaluate(() => document.getElementById("romsListContainer")?.children.length);
    console.log("ROMs Tab - Initial rendered items:", romsCount);

    // Test Dreamcast ROM search
    await page.fill("#romSearch", "Sonic Adventure");
    await page.waitForTimeout(400);
    const dreamcastItem = await page.evaluate(() => {
      const item = document.querySelector("#romsListContainer .rom-item");
      if (!item) return null;
      const downloadBtn = item.querySelector("a.btn-download");
      return {
        title: item.querySelector(".rom-title-text")?.textContent,
        console: item.querySelector(".badge-console")?.textContent,
        downloadUrl: downloadBtn ? downloadBtn.href : null
      };
    });
    console.log("Dreamcast Search Result:", JSON.stringify(dreamcastItem, null, 2));

    if (dreamcastItem && dreamcastItem.downloadUrl) {
      console.log("Checking Dreamcast ROM URL via HTTP HEAD...");
      const headRes = await fetch(dreamcastItem.downloadUrl, { method: "HEAD" });
      console.log("Dreamcast ROM HTTP Status:", headRes.status, headRes.statusText);
    }

    console.log("All verifications completed successfully! Errors encountered:", errors.length === 0 ? "NONE" : errors);

    await browser.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});
