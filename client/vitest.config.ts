import { defineConfig } from "vitest/config";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ["test/forms/*"],
    reporters: ['default', "test/svg-reporter.ts"],
    environment: 'happy-dom'
  },
  envDir: "envs/",
});