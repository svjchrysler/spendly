import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** scrollY por pathname. Vive en memoria: se pierde al recargar, como en nativo. */
const positions = new Map<string, number>()

/**
 * Scroll con semántica de app nativa: cambiar de tab arranca arriba, y volver
 * atrás recupera la posición donde estabas.
 *
 * En un SPA el browser no resetea el scroll al navegar, así que saltar de una
 * lista larga a otra pantalla te dejaba en medio de la nada.
 */
export function useScrollRestoration() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    // Si no, el browser restaura por su cuenta y pelea con lo de abajo
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = previous
    }
  }, [])

  useEffect(() => {
    if (navigationType === 'POP') {
      const saved = positions.get(pathname) ?? 0
      // rAF: la ruta nueva todavía no pintó, y sin alto no hay dónde scrollear
      requestAnimationFrame(() => window.scrollTo(0, saved))
    } else {
      window.scrollTo(0, 0)
    }

    const save = () => {
      positions.set(pathname, window.scrollY)
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      save()
      window.removeEventListener('scroll', save)
    }
  }, [pathname, navigationType])
}
