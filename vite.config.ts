import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Camper Leveller',
        short_name: 'Leveller',
        description: 'Offline camper leveling-ramp guidance.',
        display: 'standalone',
        start_url: './',
        scope: './',
        theme_color: '#315c50',
        background_color: '#f2f1e9',
      },
      workbox: {
        navigateFallback: 'index.html',
      },
    }),
  ],
})
