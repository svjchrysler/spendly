import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public')

// ponytail: pnpm add -D sharp && node scripts/generate-pwa-icons.mjs && pnpm remove sharp

/**
 * Marca de Spendly: un recibo con el borde inferior dentado.
 *
 * Mismo dibujo y mismas proporciones que `public/favicon.svg`, escalado x16
 * (viewBox 32 -> 512). El dentado replica `.receipt-edge` de `index.css`:
 * dientes a 45 grados, el doble de anchos que altos.
 *
 * Acá la paleta es fija en oscuro. Un icono instalado no sigue al tema del
 * sistema —iOS no lo recolorea— y el negro es el que casa con el splash y con
 * `theme-color`. El favicon del navegador sí adapta, porque vive dentro de un
 * chrome que cambia.
 *
 * `bleed` extiende el lienzo para el maskable. El fondo se dibuja sobre el
 * viewBox completo, no sobre los 512 originales: antes se expandía el viewBox
 * dejando el rect en 512x512, y el anillo exterior del maskable salía
 * transparente — justo lo que un maskable no puede tener.
 */
function icon({ bleed = 0 } = {}) {
  const origin = -bleed
  const span = 512 + bleed * 2
  // Un maskable ya lo recorta el sistema: la esquina redonda propia sobra
  const radius = bleed > 0 ? 0 : 112

  const slip =
    'M160 96h192a24 24 0 0 1 24 24v240l-40 40-40-40-40 40-40-40-40 40-40-40V120A24 24 0 0 1 160 96Z'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${span}" height="${span}" viewBox="${origin} ${origin} ${span} ${span}" fill="none" role="img" aria-label="Spendly">
  <defs>
    <linearGradient id="sheen" x1="256" y1="${origin}" x2="256" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".07"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="slip" x1="256" y1="96" x2="256" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".14"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="slipClip"><path d="${slip}"/></clipPath>
  </defs>

  <rect x="${origin}" y="${origin}" width="${span}" height="${span}" rx="${radius}" fill="#000000"/>
  <rect x="${origin}" y="${origin}" width="${span}" height="${span}" rx="${radius}" fill="url(#sheen)"/>

  <path d="${slip}" fill="#4ade80"/>
  <rect x="${origin}" y="${origin}" width="${span}" height="${span}" fill="url(#slip)" clip-path="url(#slipClip)"/>

  <rect x="176" y="176" width="160" height="35" rx="17.5" fill="#000000"/>
  <rect x="176" y="248" width="104" height="35" rx="17.5" fill="#000000"/>
</svg>`
}

const sizes = [
  // Estaba suelto en public/ y nadie lo regeneraba: se quedó con la marca
  // vieja. Va acá para que no vuelva a desincronizarse.
  { name: 'favicon-32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192.png', size: 192 },
  { name: 'pwa-512.png', size: 512 },
  { name: 'pwa-512-maskable.png', size: 512, pad: true },
]

for (const { name, size, pad } of sizes) {
  // 64/512 = 12.5% por lado → la marca queda dentro del 80% seguro
  const input = Buffer.from(icon({ bleed: pad ? 64 : 0 }))

  await sharp(input)
    .resize(size, size)
    .png()
    .toFile(join(out, name))
  console.log('wrote', name)
}

writeFileSync(join(out, 'pwa-icon.svg'), icon())
console.log('done')
