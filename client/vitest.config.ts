import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["test/setup.ts"],
    reporters: ['default', "test/svg-reporter.ts"]
  },
  envDir: "envs/",
});