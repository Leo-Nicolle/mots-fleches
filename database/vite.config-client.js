// vite.config.js
export default {
  build: {
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