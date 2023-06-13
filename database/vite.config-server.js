import { builtinModules as builtin } from "node:module";
/** @type {import('vite').UserConfig} */
export default {
  build: {
    lib: {
      entry: 'src/fsdb.ts',
      name: 'fsdb',
      fileName: 'fsdb',
      formats: ['es']
    },
    target: 'esnext',
    emptyOutDir: false,
    rollupOptions: {
      external: [...builtin],
    }
  },
  esbuild: {
    target: 'node20',
    platform: 'node'
  }
}