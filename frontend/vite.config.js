import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    })
  ],
  build: {
    // ✅ Code splitting más agresivo
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') && id.includes('react-dom')) {
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
        // ✅ Comprimir nombres de chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    // ✅ Minificación agresiva con Terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
        arguments: true,
        booleans: true,
        reduce_vars: true,
        unused: true,
      },
      mangle: {
        properties: {
          keep_quoted: true,
        }
      },
      format: {
        comments: false,
      }
    },
    // ✅ Optimizaciones CSS
    cssMinify: true,
    cssCodeSplit: true,

    // ✅ Límites de tamaño
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,

    // ✅ Sin sourcemaps en producción
    sourcemap: false,

    // ✅ Target moderno (reduce polyfills)
    target: 'es2020',

    // ✅ Output limpio
    outDir: 'dist',
    assetsDir: 'assets',
  },

  // ✅ Optimizar dependencias en dev
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
      'swiper'
    ],
    esbuildOptions: {
      target: 'es2020',
    }
  },

  server: {
    preTransformRequests: true,
  }
})
