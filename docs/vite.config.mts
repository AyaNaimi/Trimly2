import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Ensure asset URLs include the repo subpath when served (e.g. https://username.github.io/Trimly2/)
  base: '/Trimly2/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
