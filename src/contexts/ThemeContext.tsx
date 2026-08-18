import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { applyTheme, getStoredTheme, type Theme } from '@/lib/theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'dark' : getStoredTheme(),
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      /*
        Cambiar de tema es un cambio de superficie, no de contenido: con View
        Transitions el fundido lo hace el compositor sobre un snapshot de la
        página entera (180ms, ver `::view-transition-*` en index.css) en vez de
        repintar cincuenta elementos con transiciones sueltas y desalineadas.

        `applyTheme` va dentro del callback y antes del `flushSync`: el snapshot
        "nuevo" se toma cuando el callback termina, y si la clase `.dark` se
        aplicara después (en el efecto) el fundido saldría hacia el tema viejo.
      */
      toggleTheme: () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark'
        const doc = document as Document & {
          startViewTransition?: (callback: () => void) => unknown
        }
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (reduced || typeof doc.startViewTransition !== 'function') {
          setThemeState(next)
          return
        }

        doc.startViewTransition(() => {
          applyTheme(next)
          flushSync(() => setThemeState(next))
        })
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
