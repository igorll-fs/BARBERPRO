import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: React + React DOM separados
          'vendor-react': ['react', 'react-dom'],
          // Router separado
          'vendor-router': ['react-router-dom'],
          // Firebase core (maior dependência)
          'vendor-firebase-app': ['firebase/app'],
          'vendor-firebase-auth': ['firebase/auth'],
          'vendor-firebase-firestore': ['firebase/firestore'],
          'vendor-firebase-storage': ['firebase/storage'],
          'vendor-firebase-functions': ['firebase/functions'],
          // Zustand (pequeno, mas separado)
          'vendor-zustand': ['zustand'],
        },
      },
    },
    // Aumentar limite de aviso (bundle é grande por causa do Firebase)
    chunkSizeWarningLimit: 300,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.svg'],
      manifest: {
        name: 'BarberPro',
        short_name: 'BarberPro',
        description: 'Sistema de gestão para barbearias. Agende, gerencie e cresça.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'maskable-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache de assets estáticos (JS, CSS, fontes, imagens)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts arquivos
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API calls — NetworkFirst (sempre tenta rede, fallback cache)
            urlPattern: /^https:\/\/.*\/(api|httpPublicBarbershop)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
