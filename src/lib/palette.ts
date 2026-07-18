/**
 * Fuente de verdad de hex para JS (theme-color meta, PWA manifest, FOUC).
 * Los tokens CSS en `src/index.css` deben espejar estos valores.
 * Dark: referencia portfolio (negro + mint + coral).
 */
export const palette = {
  light: {
    background: '#f4f4f5',
    foreground: '#09090b',
    card: '#ffffff',
    popover: '#ffffff',
    primary: '#16a34a',
    primaryForeground: '#f0fdf4',
    secondary: '#e4e4e7',
    muted: '#e4e4e7',
    mutedForeground: '#71717a',
    accent: '#16a34a',
    accentForeground: '#f0fdf4',
    destructive: '#dc2626',
    destructiveForeground: '#fef2f2',
    warning: '#a16207',
    warningForeground: '#713f12',
    warningMuted: '#fef3c7',
    brandMark: '#09090b',
    brandMarkAccent: '#f4f4f5',
    chart1: '#16a34a',
    chart2: '#4ade80',
    chart3: '#a1a1aa',
    chart4: '#f87171',
    chart5: '#71717a',
  },
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    card: '#0a0a0a',
    popover: '#0a0a0a',
    primary: '#4ade80',
    primaryForeground: '#052e16',
    secondary: '#18181b',
    muted: '#18181b',
    mutedForeground: '#a1a1aa',
    accent: '#4ade80',
    accentForeground: '#052e16',
    destructive: '#f87171',
    destructiveForeground: '#1c0a0a',
    warning: '#fbbf24',
    warningForeground: '#fef3c7',
    warningMuted: '#1c1508',
    brandMark: '#000000',
    brandMarkAccent: '#ffffff',
    chart1: '#4ade80',
    chart2: '#86efac',
    chart3: '#a1a1aa',
    chart4: '#f87171',
    chart5: '#71717a',
  },
} as const

export type ThemeName = keyof typeof palette

/** Color de chrome del sistema (status bar / install splash). */
export function themeChromeColor(theme: ThemeName) {
  return palette[theme].background
}
