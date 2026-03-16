import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/src/**/*.test.ts', 'apps/**/src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['packages/**/src/**/*.ts', 'apps/**/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts', '**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@echo-party/shared': resolve(__dirname, 'packages/shared/src'),
      '@echo-party/sim': resolve(__dirname, 'packages/sim/src'),
      '@echo-party/content': resolve(__dirname, 'packages/content/src'),
      '@echo-party/tooling': resolve(__dirname, 'packages/tooling/src'),
    },
  },
});
