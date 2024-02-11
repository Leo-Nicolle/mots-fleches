import { defineConfig } from 'vite';
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: 'grid',
    },
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
    }
  }
});