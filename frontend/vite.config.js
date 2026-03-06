import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // ✅ Optimizar compilación de JSX
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
    // ✅ Minificación agresiva
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
    // ✅ Optimizaciones generales
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    sourcemap: false,
    // ✅ Polyfills para navegadores modernos
    target: 'es2020',
  },
  optimizeDeps: {
    // ✅ Pre-bundlear dependencias pesadas
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
    // ✅ Compresión de respuestas
    middlewareMode: false,
  },
})