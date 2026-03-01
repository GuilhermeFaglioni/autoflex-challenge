/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  ssr: {
    noExternal: [/@mui/, /@emotion/, /@asamuzakjp/, /@csstools/],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    server: {
      deps: {
        inline: [/@mui/, /@emotion/],
      }
    },
  },
})
