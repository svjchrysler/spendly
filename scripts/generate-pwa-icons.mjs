import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public')

// ponytail: pnpm add -D sharp && node scripts/generate-pwa-icons.mjs && pnpm remove sharp

/**
 * Marca de Spendly: monograma S en mint sobre campo de tinta.
 *
 * La S no está dibujada a mano ni sacada de una tipografía: son dos bowls
 * elípticos tangentes en el centro del lienzo, con las terminales en diagonal
 * opuesta. Construirla así deja el eje y el grosor bajo control — una S de
 * fuente hay que corregirla igual a tamaño de icono, y una spline a ojo se
 * nota temblorosa a 512.
 *
 * Monolínea con cap redondo: a 16px el contraste tiene que venir del trazo, y
 * un grosor único sobrevive el downscale mejor que una S con modulación.
 *
 * La paleta es fija en oscuro: un icono instalado no sigue al tema del sistema
 * (iOS no lo recolorea) y el negro es el que casa con el splash y con
 * `theme-color`.
 */

const FIELD_TOP = '#26262b'
const FIELD_MID = '#0b0b0d'
const FIELD_BOTTOM = '#000000'
const MINT_TOP = '#a7f3c4'
const MINT_BOTTOM = '#22c55e'

/** Bowls de la S. `top`/`bottom`: ángulos de las terminales, en grados. */
const S_SHAPE = { rx: 84, ry: 63, top: -60, bottom: 150 }
const S_WEIGHT = 80

/**
 * Talla óptica chica (favicon): más gruesa y un punto más angosta. A 16px el
 * trazo de 80 se lava y la S pierde cuerpo contra el campo.
 */
const S_SHAPE_SM = { rx: 85, ry: 62, top: -55, bottom: 145 }
const S_WEIGHT_SM = 84

const polar = (cx, cy, rx, ry, deg) => [
  cx + rx * Math.cos((deg * Math.PI) / 180),
  cy + ry * Math.sin((deg * Math.PI) / 180),
]

/** Arco elíptico partido en tramos de ≤90°: así los flags de `A` no ambiguan. */
function arc(cx, cy, rx, ry, from, to) {
  const sweep = to > from ? 1 : 0
  const steps = Math.ceil(Math.abs(to - from) / 90)
  const step = (to - from) / steps
  let d = ''
  for (let i = 1; i <= steps; i++) {
    const [x, y] = polar(cx, cy, rx, ry, from + step * i)
    d += `A${rx} ${ry} 0 0 ${sweep} ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

function sPath({ rx, ry, top, bottom }, cx = 256, cy = 256) {
  const [x0, y0] = polar(cx, cy - ry, rx, ry, top)
  return (
    `M${x0.toFixed(2)} ${y0.toFixed(2)}` +
    // bowl de arriba, en sentido antihorario hasta la junta (cx, cy)
    arc(cx, cy - ry, rx, ry, top, -270) +
    // bowl de abajo: espeja el recorrido y sale por la diagonal opuesta
    arc(cx, cy + ry, rx, ry, -90, bottom)
  )
}

const S_PATH = sPath(S_SHAPE)

/**
 * @param bleed  Lienzo extra por lado. El maskable lo recorta el sistema con
 *               una forma que no conocemos: el arte va al 80% central.
 * @param radius Esquina propia. En iOS va en 0 — el SO aplica su superelipse y
 *               una esquina ya redondeada encima deja las puntas recortadas.
 * @param mono   Silueta plana blanca sobre transparente (themed icons Android).
 */
function icon({ bleed = 0, radius = 0, mono = false } = {}) {
  const origin = -bleed
  const span = 512 + bleed * 2
  const stroke = (color) =>
    `<path d="${S_PATH}" fill="none" stroke="${color}" stroke-width="${S_WEIGHT}" stroke-linecap="round"/>`

  if (mono) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${span}" height="${span}" viewBox="${origin} ${origin} ${span} ${span}" fill="none">
  ${stroke('#ffffff')}
</svg>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${span}" height="${span}" viewBox="${origin} ${origin} ${span} ${span}" fill="none" role="img" aria-label="Spendly">
  <defs>
    <linearGradient id="field" x1="70" y1="0" x2="442" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${FIELD_TOP}"/>
      <stop offset=".5" stop-color="${FIELD_MID}"/>
      <stop offset="1" stop-color="${FIELD_BOTTOM}"/>
    </linearGradient>
    <linearGradient id="mint" x1="150" y1="100" x2="370" y2="410" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${MINT_TOP}"/>
      <stop offset="1" stop-color="${MINT_BOTTOM}"/>
    </linearGradient>
  </defs>

  <rect x="${origin}" y="${origin}" width="${span}" height="${span}" rx="${radius}" fill="url(#field)"/>
  ${stroke('url(#mint)')}
</svg>`
}

/**
 * Favicon: la talla óptica chica, plana. A 16px un gradiente es un color
 * promedio y no aporta nada. El campo se queda negro en los dos temas (igual
 * que el icono instalado) y en oscuro se suma el hairline de `BrandMark`: si
 * no, el cuadro se disuelve contra una barra de pestañas oscura.
 */
function faviconSvg() {
  const s = (n) => +(n / 16).toFixed(3) // lienzo 512 → 32
  const path = sPath(
    {
      rx: s(S_SHAPE_SM.rx),
      ry: s(S_SHAPE_SM.ry),
      top: S_SHAPE_SM.top,
      bottom: S_SHAPE_SM.bottom,
    },
    16,
    16,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" role="img" aria-label="Spendly">
  <!-- Generado por scripts/generate-pwa-icons.mjs — no editar a mano -->
  <style>
    .field { fill: #09090b }
    .edge  { stroke: none }
    @media (prefers-color-scheme: dark) {
      .field { fill: #000 }
      .edge  { stroke: #fff; stroke-opacity: .2 }
    }
  </style>
  <rect class="field" width="32" height="32" rx="7"/>
  <path d="${path}" fill="none" stroke="#4ade80" stroke-width="${s(S_WEIGHT_SM)}" stroke-linecap="round"/>
  <rect class="edge" x=".5" y=".5" width="31" height="31" rx="6.5" fill="none"/>
</svg>`
}

/** ICO con PNGs adentro (lo aceptan todos los browsers vigentes). */
function ico(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)

  let offset = 6 + entries.length * 16
  const dir = []
  for (const { size, data } of entries) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    dir.push(e)
    offset += data.length
  }
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)])
}

const raster = [
  // Sin radio: iOS enmascara con su superelipse. Opaco de punta a punta.
  { name: 'apple-touch-icon.png', size: 180, svg: icon({ radius: 0 }) },
  // El resto sí se muestra tal cual (tab de Chrome, escritorio, install prompt)
  { name: 'pwa-192.png', size: 192, svg: icon({ radius: 112 }) },
  { name: 'pwa-512.png', size: 512, svg: icon({ radius: 112 }) },
  // 64/512 = 12.5% por lado → la marca queda dentro del 80% seguro
  { name: 'pwa-512-maskable.png', size: 512, svg: icon({ bleed: 64 }) },
  { name: 'pwa-512-mono.png', size: 512, svg: icon({ bleed: 64, mono: true }) },
]

for (const { name, size, svg } of raster) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(out, name))
  console.log('wrote', name)
}

const favicon = faviconSvg()
writeFileSync(join(out, 'favicon.svg'), favicon)
console.log('wrote favicon.svg')

// librsvg rasteriza sin preferencia de tema → sale la rama clara, que es la
// correcta: un ICO no lleva media queries, y quien lo pide (Windows, crawlers,
// la barra de favoritos) tampoco manda color-scheme.
writeFileSync(
  join(out, 'favicon.ico'),
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        data: await sharp(Buffer.from(favicon)).resize(size, size).png().toBuffer(),
      })),
    ),
  ),
)
console.log('wrote favicon.ico')

writeFileSync(join(out, 'pwa-icon.svg'), icon({ radius: 112 }))
console.log('done')
