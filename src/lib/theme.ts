import { themeChromeColor, type ThemeName } from '@/lib/palette'

export type Theme = ThemeName
/** Lo que elige el usuario en Ajustes: un tema fijo o seguir al sistema */
export type ThemePreference = Theme | 'system'

const STORAGE_KEY = 'spendly-theme'

export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Sin clave guardada = Automático. `theme-boot.js` lee la misma clave. */
export function getThemePreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? systemTheme() : preference
}

export function getStoredTheme(): Theme {
  return resolveTheme(getThemePreference())
}

export function storeThemePreference(preference: ThemePreference) {
  if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, preference)
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  const color = themeChromeColor(theme)
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', color)
  })
}
