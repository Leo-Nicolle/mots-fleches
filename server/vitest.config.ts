import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "test/setup.ts",
    threads: false,
    outputDiffMaxLines: Infinity,
    environment: "node",
  },
});
