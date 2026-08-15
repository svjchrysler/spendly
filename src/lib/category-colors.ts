import type { ThemeName } from '@/lib/palette'

/**
 * Colores de entidad (categoría), no tokens de theme.
 *
 * El hex guardado en la DB es la identidad canónica y no cambia: lo que
 * cambia es cómo se pinta. Los valores de la paleta están afinados para
 * fondo claro y sobre `--group-surface` en oscuro (#131315) varios quedan
 * demasiado apagados, así que cada uno tiene su par un escalón más claro.
 *
 * El criterio es el mismo que ya usan los tokens del tema en oscuro
 * (destructive `#f87171`, primary `#4ade80`): un paso más claro en la rampa.
 */
export const categoryColorOptions = [
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#059669',
  '#64748B',
  '#EF4444',
  '#06B6D4',
] as const

export const defaultCategoryColor = categoryColorOptions[1]

const darkByLight: Record<string, string> = {
  '#f59e0b': '#fbbf24',
  '#3b82f6': '#60a5fa',
  '#8b5cf6': '#a78bfa',
  '#ec4899': '#f472b6',
  '#059669': '#34d399',
  '#64748b': '#94a3b8',
  '#ef4444': '#f87171',
  '#06b6d4': '#22d3ee',
}

/** Luminosidad mínima para que un color se despegue del fondo oscuro. */
const MIN_DARK_L = 0.62
/** Techo de saturación: sin esto un color ya claro se vuelve neón al subirlo. */
const MAX_DARK_S = 0.85

function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim().replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [
    Number.parseInt(full.slice(0, 2), 16) / 255,
    Number.parseInt(full.slice(2, 4), 16) / 255,
    Number.parseInt(full.slice(4, 6), 16) / 255,
  ]
}

function rgbToHsl([r, g, b]: [number, number, number]) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const delta = max - min

  if (delta === 0) return { h: 0, s: 0, l }

  const s = delta / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === r) h = ((g - b) / delta) % 6
  else if (max === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  return { h: (h * 60 + 360) % 360, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let rgb: [number, number, number]
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]

  const hex = rgb
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
  return `#${hex}`
}

/**
 * Fallback para colores fuera de la paleta: filas viejas o importadas pueden
 * tener cualquier hex, y esos también tienen que verse en oscuro.
 */
function lightenForDark(hex: string): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const { h, s, l } = rgbToHsl(rgb)
  if (l >= MIN_DARK_L) return hex
  return hslToHex(h, Math.min(s, MAX_DARK_S), MIN_DARK_L)
}

/** Devuelve el hex a pintar para el tema activo. */
export function resolveCategoryColor(
  color: string | null | undefined,
  theme: ThemeName,
): string | undefined {
  if (!color) return undefined
  if (theme === 'light') return color
  return darkByLight[color.trim().toLowerCase()] ?? lightenForDark(color)
}
