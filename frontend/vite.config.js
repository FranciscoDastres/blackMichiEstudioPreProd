/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/swiper')) {
            return 'swiper';
          }
          if (id.includes('node_modules/lucide')) {
            return 'icons';
          }
          if (id.includes('node_modules/axios')) {
            return 'api';
          }
          if (id.includes('/admin/')) {
            return 'admin';
          }
          if (id.includes('/user/')) {
            return 'user';
          }
        },
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      }
    },
    sourcemap: false,
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
