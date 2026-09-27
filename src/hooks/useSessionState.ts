import { useEffect, useState } from 'react'

/**
 * `useState` que sobrevive al cambio de tab (la página se desmonta) y a que iOS
 * recargue la PWA en background, pero no a cerrar la app: filtros y
 * búsquedas son de la sesión. Storage bloqueado → se comporta como useState.
 */
export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored === null ? initial : (JSON.parse(stored) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      if (value === initial) sessionStorage.removeItem(key)
      else sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // modo privado / storage lleno: el filtro vive solo en memoria
    }
  }, [key, value, initial])

  return [value, setValue] as const
}
