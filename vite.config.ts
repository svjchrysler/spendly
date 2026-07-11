import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
