import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    fileParallelism: false,
    testTimeout: 30000,
    pool: 'vmThreads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/__tests__/**', 'src/__test-utils__/**', 'src/**/*.d.ts'],
      thresholds: {
        statements: 10,
        branches: 8,
        functions: 9,
        lines: 10,
      },
    },
  },
});
