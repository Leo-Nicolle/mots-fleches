const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node18", // Adjust if using a different Node version
    outdir: "dist",
    sourcemap: true,
    logLevel: "info",
    external: ["pg", "express"], // Exclude native modules if needed
  })
  .catch(() => process.exit(1));
