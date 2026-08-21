import path from 'path'
import { readFileSync } from 'node:fs'
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
    {
      // 34 <link> de apple-touch-startup-image: viven en un partial generado
      // junto a los PNG (scripts/generate-ios-splash.mjs) para no duplicar la
      // lista de devices ni enterrar index.html.
      name: 'spendly-ios-splash-links',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          const partial = path.resolve(__dirname, 'scripts/ios-splash-links.html')
          let links: string
          try {
            links = readFileSync(partial, 'utf8')
          } catch {
            console.warn('[spendly] faltan las splash de iOS — corré scripts/generate-ios-splash.mjs')
            return html
          }
          return html.replace('</head>', `${links}</head>`)
        },
      },
    },
    {
      // Los woff2 viven dentro del CSS: el browser recién los descubre tras
      // parsearlo. Preload con el nombre hasheado real → sin FOUT en el arranque.
      name: 'spendly-font-preload',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          const fonts = Object.keys(ctx.bundle ?? {}).filter((file) =>
            file.endsWith('.woff2'),
          )
          return {
            html,
            tags: fonts.map((file) => ({
              tag: 'link',
              attrs: {
                rel: 'preload',
                as: 'font',
                type: 'font/woff2',
                href: `/${file}`,
                crossorigin: '',
              },
              injectTo: 'head-prepend' as const,
            })),
          }
        },
      },
    },
    VitePWA({
      // `prompt` (no autoUpdate): con autoUpdate el SW nuevo recarga la pestaña
      // en caliente y se lleva puesto un form a medio llenar. La versión nueva
      // se aplica en background — ver src/lib/register-pwa.ts.
      registerType: 'prompt',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192.png',
        'pwa-512.png',
        'pwa-512-maskable.png',
        'pwa-512-mono.png',
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
        prefer_related_applications: false,
        // Long-press del icono / jump list de escritorio
        shortcuts: [
          {
            name: 'Agregar gasto',
            short_name: 'Agregar',
            description: 'Registrar un gasto nuevo',
            url: '/gastos?nuevo=1',
            icons: [{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Análisis',
            short_name: 'Análisis',
            description: 'Ver el análisis del mes',
            url: '/analisis',
            icons: [{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
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
          {
            // Themed icons de Android: el SO tinta la silueta con el wallpaper
            src: 'pwa-512-mono.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // El fallback es para navegaciones del SPA: una URL con extensión es un
        // asset que faltó, y devolverle el index enmascara el 404 como pantalla rota
        navigateFallbackDenylist: [/\/[^/?]+\.[^/?]+$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // El update lo aplicamos nosotros en background, no en caliente
        skipWaiting: false,
        // Self-hosted fonts only (fontsource) — no Google Fonts runtime caches
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        // Las splash de iOS pesan y las pide el SO, no la app: fuera del precache
        globIgnores: ['**/node_modules/**', 'splash/**'],
        runtimeCaching: [
          {
            // Never cache auth tokens / session responses
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/v1\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // REST reads only — fail fast to cache on flaky mobile
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'supabase-rest',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 96,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              // Solo 200: un opaque (0) de una API con auth no se puede leer ni
              // validar, y guardarlo solo sirve para envenenar la cache
              cacheableResponse: { statuses: [200] },
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
              // La `/` final importa: sin ella `react` matchea también `react-is`
              // y `react-smooth` (deps de recharts) y se bajan en el arranque.
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|use-sync-external-store)\//,
            },
            {
              // Va ANTES que recharts a propósito. Estos utils los comparten el
              // shell y los charts; sin grupo propio caían dentro del chunk de
              // recharts, y entonces el entry lo importaba estático solo para
              // resolver `cn()` — 111 kB gz de charts en el critical path.
              name: 'ui-vendor',
              test: /node_modules\/(clsx|tailwind-merge|class-variance-authority)/,
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
