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
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'swiper'],
          'utils': ['axios'],
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
        passes: 2, // ✅ Múltiples pases de compresión
      },
      mangle: true,
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
