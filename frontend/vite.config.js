import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ✅ Code splitting aggressive
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'swiper'],
          'utils': ['axios'],
        }
      }
    },
    // ✅ Optimizaciones
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    // ✅ Chunk size mínimo
    chunkSizeWarningLimit: 600,
    // ✅ Reporta compresión
    reportCompressedSize: false,
    // ✅ Sourcemaps solo en dev
    sourcemap: false
  },
  // ✅ Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react', 'swiper']
  },
  // ✅ Performance hints
  server: {
    preTransformRequests: true
  }
})
