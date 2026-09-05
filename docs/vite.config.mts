import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this repository under the /Trimly2/ project path.
  base: '/Trimly2/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
