import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
  },
  server: {
    // This allows the frontend dev server to talk to the Vercel serverless functions running on a different port.
    proxy: {
      '/api': 'http://localhost:3001', // Assuming vercel dev runs on 3001
    },
  },
});
