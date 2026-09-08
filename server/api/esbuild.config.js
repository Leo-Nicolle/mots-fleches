const esbuild = require("esbuild");
const fs = require("fs");

// Admin routes live in a private repo and are injected at deploy time.
// Build them as separate entries only when present so the public repo
// still builds without them (the API loads them optionally at runtime).
const entries = ["./src/index.ts"];
if (fs.existsSync("./src/routes/admin.ts")) {
  entries.push("./src/routes/admin.ts");
}
if (fs.existsSync("./src/routes/plausible.ts")) {
  entries.push("./src/routes/plausible.ts");
}

esbuild
  .build({
    entryPoints: entries,
    bundle: true,
    platform: "node",
    target: "node18", // Adjust if using a different Node version
    outdir: "dist",
    sourcemap: true,
    logLevel: "info",
    preserveSymlinks: true, // Resolve admin route imports relative to their symlink location
    external: ["pg", "express", "./routes/admin", "./routes/plausible"], // Exclude native modules and optional admin routes
  })
  .catch(() => process.exit(1));
