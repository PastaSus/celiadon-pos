import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    },
    // shared/types.ts sits outside client/, so Vite needs permission to serve it.
    fs: {
      allow: ['..']
    }
  }
})
