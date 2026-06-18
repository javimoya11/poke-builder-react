import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      utils: fileURLToPath(new URL('./src/shared/utils', import.meta.url)),
      hooks: fileURLToPath(new URL('./src/shared/hooks', import.meta.url)),
      feature: fileURLToPath(new URL('./src/feature', import.meta.url)),
      types: fileURLToPath(new URL('./src/shared/types.ts', import.meta.url))
    }
  }
});
