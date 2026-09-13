import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // Serve the real dictionaries during dev; don't copy them into the lib dist
  publicDir: command === 'serve' ? 'demo/public' : false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AutoFill',
      fileName: 'auto-fill',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Vue is not used by the lib itself — only by the demo
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
}))
