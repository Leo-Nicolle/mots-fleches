import { defineConfig } from "vitest/config";

const setupFiles = process.cwd().endsWith("server")
  ? "test/setup.ts"
  : "server/test/setup.ts";

export default defineConfig({
  test: {
    setupFiles,
    threads: false,
    outputDiffMaxLines: Infinity,
    environment: "node",
  },
});
