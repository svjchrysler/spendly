import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import {
  applyTheme,
  getThemePreference,
  resolveTheme,
  storeThemePreference,
  systemTheme,
  type Theme,
  type ThemePreference,
} from '@/lib/theme'

interface ThemeContextValue {
  /** Tema efectivo, ya resuelto contra el sistema */
  theme: Theme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window === 'undefined' ? 'system' : getThemePreference(),
  )
  const [system, setSystem] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'light' : systemTheme(),
  )
  const theme = preference === 'system' ? system : preference

  // En Automático el tema sigue al sistema en vivo (el cambio de iOS al
  // atardecer), no solo al abrir la app
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystem(media.matches ? 'dark' : 'light')
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      preference,
      /*
        Cambiar de tema es un cambio de superficie, no de contenido: con View
        Transitions el fundido lo hace el compositor sobre un snapshot de la
        página entera (180ms, ver `::view-transition-*` en index.css) en vez de
        repintar cincuenta elementos con transiciones sueltas y desalineadas.

        `applyTheme` va dentro del callback y antes del `flushSync`: el snapshot
        "nuevo" se toma cuando el callback termina, y si la clase `.dark` se
        aplicara después (en el efecto) el fundido saldría hacia el tema viejo.
      */
      setPreference: (next: ThemePreference) => {
        storeThemePreference(next)
        const nextTheme = resolveTheme(next)
        const doc = document as Document & {
          startViewTransition?: (callback: () => void) => unknown
        }
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (nextTheme === theme || reduced || typeof doc.startViewTransition !== 'function') {
          setPreferenceState(next)
          return
        }

        doc.startViewTransition(() => {
          applyTheme(nextTheme)
          flushSync(() => setPreferenceState(next))
        })
      },
    }),
    [theme, preference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
