import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// ponytail: pnpm add -D sharp && node scripts/generate-ios-splash.mjs && pnpm remove sharp
//
// iOS solo usa una `apple-touch-startup-image` si el media query calza EXACTO
// con el device, así que hace falta un PNG por tamaño y por tema.
//
// Las formas se rasterizan acá (SDF + antialias analítico) en vez de delegarlas
// a un SVG: así las métricas son las mismas constantes que #app-splash de
// index.html y el arranque nativo empalma con el splash HTML sin salto. sharp
// solo pone el wordmark, con `system-ui` → SF Pro, la misma familia que resuelve
// iOS al pintar el splash HTML.
//
// Genera también scripts/ios-splash-links.html, que vite.config.ts inyecta en
// el <head>: una sola fuente de verdad para la lista de devices.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'splash')

// Espeja src/lib/palette.ts (no lo importamos: es TS y esto corre en node pelado)
const themes = {
  light: {
    background: '#f4f4f5',
    foreground: '#09090b',
    mark: '#09090b',
    coin: '#16a34a',
    slot: '#09090b',
    ring: null,
  },
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    mark: '#000000',
    coin: '#4ade80',
    slot: '#000000',
    ring: '#ffffff',
  },
}

/** Portrait, en CSS px + DPR. Cubre el parque de iPhone y iPad vigente. */
const devices = [
  [375, 667, 2],
  [414, 736, 3],
  [375, 812, 3],
  [390, 844, 3],
  [393, 852, 3],
  [402, 874, 3],
  [414, 896, 2],
  [414, 896, 3],
  [428, 926, 3],
  [430, 932, 3],
  [440, 956, 3],
  [768, 1024, 2],
  [810, 1080, 2],
  [820, 1180, 2],
  [834, 1112, 2],
  [834, 1194, 2],
  [1024, 1366, 2],
]

// Métricas de #app-splash en px CSS (1rem = 16px)
const MARK = 52
const RADIUS = 10.4
const GAP = 17.6
const WORD_SIZE = 18.4
/** Line box del <p>: el preflight de Tailwind pone line-height 1.5 (medido en el DOM). */
const WORD_LINE = WORD_SIZE * 1.5
/** SF Pro @18.4px vía canvas TextMetrics: ascent 18px, descent 4px. */
const WORD_ASCENT = 18 / 18.4
const WORD_DESCENT = 4 / 18.4
/** Baseline desde el top de la line box: half-leading + ascent. */
const WORD_BASELINE =
  (WORD_LINE - WORD_SIZE * (WORD_ASCENT + WORD_DESCENT)) / 2 + WORD_SIZE * WORD_ASCENT
const PULSE_W = 28 * 0.45 // el pulse arranca en scaleX(0.45)
const PULSE_H = 2
const BLOCK = MARK + GAP + WORD_LINE + GAP + PULSE_H

const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)

/** Distancia con signo a un rect redondeado (negativa adentro). */
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r)
  const qy = Math.abs(py - cy) - (hh - r)
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  )
}

/** Layout compartido por las formas y el wordmark, en px de device. */
function layout(width, height, dpr) {
  const top = ((height - BLOCK) / 2) * dpr
  return {
    top,
    cx: (width / 2) * dpr,
    mark: MARK * dpr,
    markCy: top + (MARK / 2) * dpr,
    wordBaseline: top + (MARK + GAP + WORD_BASELINE) * dpr,
    pulseCy: top + (MARK + GAP + WORD_LINE + GAP + PULSE_H / 2) * dpr,
  }
}

function renderShapes(width, height, dpr, theme) {
  const palette = themes[theme]
  const W = Math.round(width * dpr)
  const H = Math.round(height * dpr)
  const raw = Buffer.alloc(W * H * 3)

  const bg = rgb(palette.background)
  for (let i = 0; i < W * H; i++) {
    raw[i * 3] = bg[0]
    raw[i * 3 + 1] = bg[1]
    raw[i * 3 + 2] = bg[2]
  }

  // Mezcla `color` con cobertura analítica sobre la caja indicada
  const paint = (color, box, sdf, opacity = 1) => {
    const [c0, c1, c2] = rgb(color)
    const yStart = Math.max(0, Math.floor(box[1]))
    const yEnd = Math.min(H, Math.ceil(box[3]))
    const xStart = Math.max(0, Math.floor(box[0]))
    const xEnd = Math.min(W, Math.ceil(box[2]))
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const a = clamp01(0.5 - sdf(x + 0.5, y + 0.5)) * opacity
        if (a <= 0) continue
        const p = (y * W + x) * 3
        raw[p] = Math.round(raw[p] + (c0 - raw[p]) * a)
        raw[p + 1] = Math.round(raw[p + 1] + (c1 - raw[p + 1]) * a)
        raw[p + 2] = Math.round(raw[p + 2] + (c2 - raw[p + 2]) * a)
      }
    }
  }

  const { cx, markCy, pulseCy } = layout(width, height, dpr)
  const markH = (MARK * dpr) / 2
  const radius = RADIUS * dpr
  const pad = 2 * dpr

  const markSdf = (px, py) => sdRoundRect(px, py, cx, markCy, markH, markH, radius)
  const markBox = [cx - markH - pad, markCy - markH - pad, cx + markH + pad, markCy + markH + pad]
  paint(palette.mark, markBox, markSdf)

  // En oscuro el campo es el fondo mismo: lo define el aro, como el box-shadow del CSS
  if (palette.ring) {
    const half = dpr / 2
    paint(palette.ring, markBox, (px, py) => Math.abs(markSdf(px, py)) - half, 0.2)
  }

  const coinR = ((MARK * 0.58) / 2) * dpr
  paint(
    palette.coin,
    [cx - coinR - pad, markCy - coinR - pad, cx + coinR + pad, markCy + coinR + pad],
    (px, py) => Math.hypot(px - cx, py - markCy) - coinR,
  )

  const slotW = (MARK * 0.36 * dpr) / 2
  const slotH = (MARK * 0.11 * dpr) / 2
  paint(
    palette.slot,
    [cx - slotW - pad, markCy - slotH - pad, cx + slotW + pad, markCy + slotH + pad],
    (px, py) => sdRoundRect(px, py, cx, markCy, slotW, slotH, slotH),
  )

  const pulseW = (PULSE_W * dpr) / 2
  const pulseH = (PULSE_H * dpr) / 2
  paint(
    palette.coin,
    [cx - pulseW - pad, pulseCy - pulseH - pad, cx + pulseW + pad, pulseCy + pulseH + pad],
    (px, py) => sdRoundRect(px, py, cx, pulseCy, pulseW, pulseH, pulseH),
    0.45,
  )

  return { raw, W, H }
}

function wordmarkSvg(width, height, dpr, theme) {
  const { cx, wordBaseline } = layout(width, height, dpr)
  // `system-ui` resuelve a SF Pro, igual que la stack del splash HTML en iOS
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width * dpr)}" height="${Math.round(height * dpr)}">` +
      `<text x="${cx.toFixed(2)}" y="${wordBaseline.toFixed(2)}" text-anchor="middle" ` +
      `fill="${themes[theme].foreground}" font-family="system-ui, -apple-system, sans-serif" ` +
      `font-size="${(WORD_SIZE * dpr).toFixed(2)}" font-weight="600" ` +
      `letter-spacing="${(-0.03 * WORD_SIZE * dpr).toFixed(3)}">Spendly</text></svg>`,
  )
}

mkdirSync(out, { recursive: true })

const links = []
let bytes = 0

for (const [width, height, dpr] of devices) {
  for (const theme of Object.keys(themes)) {
    const name = `${theme}-${width}x${height}@${dpr}.png`
    const { raw, W, H } = renderShapes(width, height, dpr, theme)
    const png = await sharp(raw, { raw: { width: W, height: H, channels: 3 } })
      .composite([{ input: wordmarkSvg(width, height, dpr, theme), top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toBuffer()
    writeFileSync(join(out, name), png)
    bytes += png.length
    links.push(
      `<link rel="apple-touch-startup-image" href="/splash/${name}" ` +
        `media="(prefers-color-scheme: ${theme}) and (device-width: ${width}px) and (device-height: ${height}px) ` +
        `and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" />`,
    )
  }
}

writeFileSync(join(root, 'scripts', 'ios-splash-links.html'), `${links.join('\n')}\n`)
console.log(`${links.length} splash images · ${(bytes / 1024).toFixed(0)} kB total`)
