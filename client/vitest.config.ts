import { defineConfig } from "vitest/config";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ["test/forms/*"],
    setupFiles: ["test/setup.ts"],
    // reporters: ['default', "test/svg-reporter.ts"],
    environment: 'jsdom'
  },
  envDir: "envs/",
});