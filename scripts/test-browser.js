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
  ".ico": "image/x-icon"
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
        "Content-Length": upstream.headers.get("content-length") || ""
      });
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
      "Access-Control-Allow-Origin": "*"
    });
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
    page.on("response", (res) => {
      if (res.status() >= 400 && !res.url().includes("archive.org")) {
        errors.push(`HTTP ${res.status()} on ${res.url()}`);
      }
    });

    console.log("Navigating to http://localhost:" + PORT);
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForTimeout(1000);

    // 1. Verify Home Tab
    const activeTab1 = await page.evaluate(() => document.querySelector(".tab-btn.active")?.dataset.tab);
    console.log("Initial Active Tab:", activeTab1);

    // 2. Switch to Web Ports Tab
    await page.click('button[data-tab="ports"]');
    await page.waitForTimeout(500);
    const portsCount = await page.evaluate(() => {
      const el = document.getElementById("portsGridContainer");
      return el ? el.children.length : -1;
    });
    const portsText = await page.evaluate(() => document.getElementById("portsCountText")?.textContent);
    console.log("Web Ports Tab - Rendered Cards:", portsCount, "Text:", portsText);

    // 3. Test filter chip in Web Ports
    await page.click('.port-cat-chip[data-cat="Populares"]');
    await page.waitForTimeout(300);
    const popCount = await page.evaluate(() => document.getElementById("portsGridContainer")?.children.length);
    console.log("Populares Filter - Rendered Cards:", popCount);

    // 4. Test search in Web Ports
    await page.fill("#portSearch", "GTA");
    await page.waitForTimeout(400);
    const gtaCount = await page.evaluate(() => document.getElementById("portsGridContainer")?.children.length);
    console.log("Search 'GTA' - Rendered Cards:", gtaCount);

    // 5. Switch to Emulators Tab
    await page.click('button[data-tab="emulators"]');
    await page.waitForTimeout(500);
    const classicsCount = await page.evaluate(() => document.getElementById("classicsGrid")?.children.length);
    console.log("Emulators Tab - Classics count:", classicsCount);

    // 6. Switch to ROMs Tab
    await page.click('button[data-tab="roms"]');
    await page.waitForTimeout(1000);
    const romsCount = await page.evaluate(() => document.getElementById("romsListContainer")?.children.length);
    const romsText = await page.evaluate(() => document.getElementById("romsCountText")?.textContent);
    console.log("ROMs Tab - Initial rendered count:", romsCount, "Text:", romsText);

    console.log("Page Errors encountered:", errors.length === 0 ? "NONE (Clean!)" : errors);

    await browser.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});
