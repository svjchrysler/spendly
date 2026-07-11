import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public')

// ponytail: pnpm add -D sharp && node scripts/generate-pwa-icons.mjs && pnpm remove sharp
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#000000"/>
  <circle cx="256" cy="256" r="144" fill="#6fb38a" fill-opacity="0.22"/>
  <path fill="#6fb38a" d="M156 192.8c0-45.6 38.4-78.4 100-78.4 51.2 0 88.8 24.8 102.4 61.6l-43.2 19.2c-8-19.2-27.2-32-58.4-32-31.2 0-50.4 15.2-50.4 36 0 20 14.4 31.2 50.4 40.8l24 6.4c51.2 13.6 77.6 38.4 77.6 78.4 0 51.2-40.8 84-100.8 84-56.8 0-98.4-26.4-112-68.8l44-20c8.8 24.8 32 40 68 40 34.4 0 56-16 56-39.2 0-20-14.4-31.2-51.2-41.6l-24.8-6.4c-51.2-13.6-76.8-38.4-76.8-78.4Z"/>
</svg>`

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192.png', size: 192 },
  { name: 'pwa-512.png', size: 512 },
  { name: 'pwa-512-maskable.png', size: 512, pad: true },
]

for (const { name, size, pad } of sizes) {
  const input = pad
    ? Buffer.from(
        svg.replace(
          'viewBox="0 0 512 512"',
          'viewBox="-64 -64 640 640"',
        ).replace('rx="112"', 'rx="0"'),
      )
    : Buffer.from(svg)

  await sharp(input)
    .resize(size, size)
    .png()
    .toFile(join(out, name))
  console.log('wrote', name)
}

writeFileSync(join(out, 'pwa-icon.svg'), svg)
console.log('done')
