import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Handle problematic Node.js modules
      'fsevents': false,
      'module': false
    }
  },
  build: {
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      external: (id) => {
        // Only externalize problematic Node.js modules, not React
        const nodeModules = ['fsevents', 'module', 'node:module', 'node:fs', 'node:path'];
        return nodeModules.includes(id) || nodeModules.some(mod => id.includes(mod)) && !id.includes('react');
      },
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better compatibility
    target: 'es2015',
    // Use esbuild for minification (faster and included with Vite)
    minify: 'esbuild'
  },
  // Optimize for development
  server: {
    port: 5173,
    hmr: {
      overlay: false
    }
  }
})
