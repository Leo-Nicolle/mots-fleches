// Pre-renders public pages of the Vue SPA to static HTML so crawlers and
// social scrapers see real content without executing JavaScript.
//
// Runs after `vite build` (which produces client/dist). Serves that build on
// a local HTTP server, renders the routes in headless Chromium via Playwright,
// and writes the captured HTML back into client/dist.
//
// Usage:  node scripts/prerender.mjs
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "client", "dist");
const PORT = 4175;

// Must be set before importing Playwright so its browser registry resolves
// the workspace-local browser install.
process.env.PLAYWRIGHT_BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(ROOT, ".pw-browsers");

const { chromium } = await import("playwright");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".zip": "application/zip",
  ".ttf": "font/ttf",
  ".md": "text/markdown",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
};

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname
    );
    let filePath = path.join(DIST, urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const indexInDir = path.join(filePath, "index.html");
      if (fs.existsSync(indexInDir)) {
        filePath = indexInDir;
      } else {
        // SPA history fallback
        filePath = path.join(DIST, "index.html");
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

// Each route: the URL path and a predicate that resolves once the page is
// fully rendered (so we don't capture an empty #app).
const ROUTES = [
  {
    path: "/",
    outFile: "index.html",
    ready: (page) =>
      page.waitForSelector("#app h1", { timeout: 20000 }),
  },
  {
    path: "/changelog",
    outFile: path.join("changelog", "index.html"),
    ready: (page) =>
      page.waitForFunction(
        () => {
          const el = document.querySelector("#app .content");
          return el && el.children.length > 0 && el.textContent.trim().length > 0;
        },
        { timeout: 20000 }
      ),
  },
];

async function main() {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    throw new Error(
      `client/dist/index.html not found — run "npm run build:client" first.`
    );
  }

  const server = await startServer();
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      try {
        const url = `http://localhost:${PORT}${route.path}`;
        console.log(`Prerendering ${route.path} …`);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await route.ready(page);
        // Small settle delay for i18n + async patches to flush.
        await page.waitForTimeout(500);

        const html = await page.content();
        const outPath = path.join(DIST, route.outFile);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html, "utf8");
        console.log(`  → wrote ${path.relative(ROOT, outPath)} (${html.length} bytes)`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
