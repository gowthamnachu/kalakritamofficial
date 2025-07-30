import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Separate chunk for components
          components: [
            './src/components/Gallery',
            './src/components/Workshops',
            './src/components/Artists',
            './src/components/About',
            './src/components/Events',
            './src/components/ArtBlogs'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // Optimize for development
  server: {
    hmr: {
      overlay: false
    }
  }
})
