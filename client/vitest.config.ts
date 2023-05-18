import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ['default', "test/svg-reporter.ts"]
  },
  envDir: "envs/",
});