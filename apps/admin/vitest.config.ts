import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['tests/setup-env.ts'],
    include: [
      'lib/**/*.test.ts',
      'components/**/*.test.ts',
      'tests/**/*.test.ts',
    ],
    testTimeout: 30_000,
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, '.') },
  },
});