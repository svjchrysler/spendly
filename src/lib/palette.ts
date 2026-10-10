/**
 * Fuente de verdad de hex para JS (theme-color meta, PWA manifest, FOUC).
 * Los tokens CSS en `src/index.css` deben espejar estos valores.
 * Claro: papel cálido + tinta + esmeralda. Oscuro: tinta cálida + el mint del ícono.
 */
export const palette = {
  light: {
    background: '#f3efe7',
    foreground: '#17160f',
    card: '#fcfaf5',
    popover: '#fcfaf5',
    groupBg: '#f3efe7',
    groupSurface: '#fcfaf5',
    groupSurfaceRaised: '#f7f3eb',
    primary: '#0f6b47',
    primaryForeground: '#f1fbf4',
    secondary: '#e7e1d5',
    muted: '#e7e1d5',
    mutedForeground: '#6f6b60',
    accent: '#0f6b47',
    accentForeground: '#f1fbf4',
    destructive: '#c0392b',
    destructiveForeground: '#fdf3f1',
    warning: '#96600a',
    warningForeground: '#5f3d07',
    warningMuted: '#f7ead0',
    brandMark: '#17160f',
    brandMarkAccent: '#f3efe7',
    chart1: '#0f6b47',
    chart2: '#4fae84',
    chart3: '#a8a294',
    chart4: '#d9614f',
    chart5: '#7a7568',
  },
  dark: {
    background: '#0c0d0b',
    foreground: '#f5f2ea',
    card: '#181916',
    popover: '#22231f',
    groupBg: '#0c0d0b',
    groupSurface: '#181916',
    groupSurfaceRaised: '#22231f',
    primary: '#4ade80',
    primaryForeground: '#052e16',
    secondary: '#1b1c18',
    muted: '#1b1c18',
    mutedForeground: '#9c988c',
    accent: '#4ade80',
    accentForeground: '#052e16',
    destructive: '#ff8674',
    destructiveForeground: '#2a0d08',
    warning: '#f2c14e',
    warningForeground: '#fbeecb',
    warningMuted: '#211a08',
    brandMark: '#0c0d0b',
    brandMarkAccent: '#f5f2ea',
    chart1: '#4ade80',
    chart2: '#8eeab0',
    chart3: '#9b978b',
    chart4: '#ff8674',
    chart5: '#6f6c63',
  },
} as const

export type ThemeName = keyof typeof palette

/** Color de chrome del sistema (status bar / install splash). */
export function themeChromeColor(theme: ThemeName) {
  return palette[theme].background
}
