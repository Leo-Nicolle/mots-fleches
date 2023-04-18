import { defineConfig } from "vitest/config";
import { resolve } from "./test/utils";

const setupFiles = resolve("test/setup.ts");
export default defineConfig({
  test: {
    setupFiles,
    threads: false,
    outputDiffMaxLines: Infinity,
    environment: "node",
  },
});
