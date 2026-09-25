import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(media.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Ancho regular: decide layout y presentación (sidebar, Dialog), no gestos. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 768px)')
}

/**
 * Puntero táctil: decide gestos y densidad. El iPhone Duo abierto es ancho
 * *y* táctil — con solo el ancho recibía la UI de mouse.
 */
export function useIsTouch() {
  return useMediaQuery('(pointer: coarse)')
}
