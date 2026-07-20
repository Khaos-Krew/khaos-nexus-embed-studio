import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/khaos-nexus-embed-studio/',
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
  },
});
