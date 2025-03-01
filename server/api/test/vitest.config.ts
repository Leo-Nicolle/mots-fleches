import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['test/setup.ts'], // Setup file for global mocks
    include: ['test/**/*.test.ts'], // Include all test files in the test folder
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});
