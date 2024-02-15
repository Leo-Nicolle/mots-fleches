// vite.config.js
export default {
  build: {
    sourcemap: 'inline',
    minify: false,
    lib: {
      entry: 'src/index-client.ts',
      name: 'clientdb',
      fileName: 'clientdb',
    },
    emptyOutDir: false,
    rollupOptions: {
      external: ['axios']
    }
  }
}