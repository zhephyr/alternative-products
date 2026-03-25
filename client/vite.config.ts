import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/ + https://vitest.dev/config/
export default defineConfig({
  plugins: [
    // React plugin with Fast Refresh support
    react(),
    // Tailwind CSS via Vite plugin (v4)
    tailwindcss(),
  ],
  test: {
    // Use jsdom for browser-like test environment
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
