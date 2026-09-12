import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

process.env.NODE_ENV = 'test';
config({ path: path.resolve(__dirname, '..', '..', '.env.test') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['test/setup.ts'],
    include: ['test/**/*.test.ts'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});
