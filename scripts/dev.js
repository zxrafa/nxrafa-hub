import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || 3000;
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

  // CORS Proxy Endpoint (idêntico ao api/proxy.js da Vercel)
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
    } catch (e) {}

    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
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

  // Static File Serving
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

server.listen(PORT, () => {
  console.log(`[NXRAFA HUB] Servidor rodando em http://localhost:${PORT}`);
});
