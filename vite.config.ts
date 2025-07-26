import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/FitVision/',
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@tensorflow/tfjs', '@tensorflow-models/pose-detection']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          tensorflow: ['@tensorflow/tfjs', '@tensorflow-models/pose-detection']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
});
