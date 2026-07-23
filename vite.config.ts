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
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
      },
    }),
  ],
})
