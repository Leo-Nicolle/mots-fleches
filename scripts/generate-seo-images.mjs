// Generates SEO images (og-image.png + apple-touch-icon.png) from icon.svg
// using a headless Chromium (system install) via Playwright.
// Run once:  node scripts/generate-seo-images.mjs
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "client", "public");

// Must be set before importing Playwright so its browser registry resolves
// the workspace-local browser install.
process.env.PLAYWRIGHT_BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(ROOT, ".pw-browsers");

const { chromium } = await import("playwright");

const ICON_SVG = fs.readFileSync(path.join(PUBLIC_DIR, "icon.svg"), "utf8");

const CHROMIUM_PATHS = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
].filter(Boolean);

async function launch() {
  // Prefer the bundled Playwright Chromium.
  try {
    return await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  } catch (e) {
    console.warn(`Bundled Chromium unavailable: ${e.message}`);
  }
  // Fall back to a system Chromium.
  for (const executablePath of CHROMIUM_PATHS) {
    try {
      const browser = await chromium.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-gpu"],
      });
      return browser;
    } catch (e) {
      console.warn(`Failed to launch ${executablePath}: ${e.message}`);
    }
  }
  throw new Error(
    "No Chromium available. Run `PLAYWRIGHT_BROWSERS_PATH=<workspace>/.pw-browsers npx playwright install chromium` or set CHROMIUM_PATH."
  );
}

const ogHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="margin:0;width:1200px;height:630px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a73e8 0%,#0d47a1 100%);font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:flex;align-items:center;gap:48px;padding:0 64px;">
    <div style="width:260px;height:260px;background:#ffffff;border-radius:56px;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
      ${ICON_SVG.replace(/width="[^"]*"/, 'width="200px"').replace(/height="[^"]*"/, 'height="200px"')}
    </div>
    <div style="color:#ffffff;">
      <div style="font-size:96px;font-weight:800;line-height:1;letter-spacing:-1px;">MotsFlex</div>
      <div style="font-size:34px;font-weight:500;margin-top:20px;opacity:0.95;">Générateur de mots fléchés<br/>et de mots croisés en ligne</div>
    </div>
  </div>
</body>
</html>`;

const appleHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="margin:0;width:180px;height:180px;display:flex;align-items:center;justify-content:center;background:#ffffff;">
  ${ICON_SVG.replace(/width="[^"]*"/, 'width="150px"').replace(/height="[^"]*"/, 'height="150px"')}
</body>
</html>`;

async function main() {
  const browser = await launch();
  try {
    // OG image 1200x630
    {
      const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      await page.setContent(ogHtml, { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(PUBLIC_DIR, "og-image.png"), type: "png" });
      await page.close();
      console.log("Wrote og-image.png");
    }
    // Apple touch icon 180x180
    {
      const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
      await page.setContent(appleHtml, { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(PUBLIC_DIR, "apple-touch-icon.png"), type: "png" });
      await page.close();
      console.log("Wrote apple-touch-icon.png");
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
