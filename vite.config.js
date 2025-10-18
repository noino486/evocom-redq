import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations pour réduire l'utilisation mémoire
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          icons: ['react-icons/fa'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 1000,
    // Optimiser les assets
    assetsInlineLimit: 0
  },
  // Optimisations de développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  },
  // Réduire la mémoire utilisée
  esbuild: {
    target: 'es2020',
    minify: true
  }
})

