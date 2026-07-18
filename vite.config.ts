import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { palette } from './src/lib/palette.ts'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spendly-palette-html',
      transformIndexHtml(html) {
        const light = palette.light
        const dark = palette.dark
        return html
          .replaceAll('__THEME_LIGHT__', light.background)
          .replaceAll('__THEME_DARK__', dark.background)
          .replaceAll('__FG_LIGHT__', light.foreground)
          .replaceAll('__FG_DARK__', dark.foreground)
          .replaceAll('__PRIMARY_LIGHT__', light.primary)
          .replaceAll('__PRIMARY_DARK__', dark.primary)
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192.png',
        'pwa-512.png',
        'pwa-512-maskable.png',
      ],
      manifest: {
        id: '/',
        name: 'Spendly',
        short_name: 'Spendly',
        description: 'Gestiona tus gastos mensuales',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        background_color: palette.dark.background,
        theme_color: palette.dark.background,
        categories: ['finance', 'productivity'],
        // Reuse the open PWA window when launched again (app-like, not a new tab)
        handle_links: 'preferred',
        launch_handler: { client_mode: 'navigate-existing' },
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Self-hosted fonts only (fontsource) — no Google Fonts runtime caches
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        runtimeCaching: [
          {
            // NetworkFirst + short timeout: fail fast to cache on flaky mobile
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 96,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)/,
            },
            {
              name: 'recharts',
              test: /node_modules\/(recharts|d3-|victory-vendor|internmap|delaunator)/,
            },
            {
              name: 'motion',
              test: /node_modules\/framer-motion/,
            },
            {
              name: 'supabase',
              test: /node_modules\/(@supabase|@supabase\/)/,
            },
          ],
        },
      },
    },
  },
})
