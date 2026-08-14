import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** Debajo de esto la barra siempre está entera (zona de "estoy arriba"). */
const TOP_ZONE = 72
/** Ruido de scroll que no debe alcanzar para cambiar de estado. */
const MIN_DELTA = 10
/** Ventana muerta tras navegar: useScrollRestoration reposiciona en un rAF. */
const ARM_DELAY = 150

/**
 * Colapsa el tab bar al scrollear hacia abajo y lo expande al subir, como el
 * tab bar de iOS 26: la cápsula se encoge y los labels desaparecen, pero nunca
 * se va del todo.
 *
 * El alto reservado en `<main>` no depende de esto a propósito: si el padding
 * cambiara con el scroll, la página se reflow-earía en cada frame.
 */
export function useTabBarCollapse() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    // Cada pantalla entra con la barra completa
    setCollapsed(false)

    let last = window.scrollY
    let frame = 0
    // El scrollTo de useScrollRestoration no es un gesto: hasta acá, solo
    // seguimos la posición sin decidir nada
    const armedAt = performance.now() + ARM_DELAY

    const measure = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - last

      if (performance.now() < armedAt) {
        last = y
        return
      }

      if (y < TOP_ZONE) {
        last = y
        setCollapsed(false)
        return
      }

      // Sin este guard el micro-scroll haría parpadear la cápsula. No tocamos
      // `last` para que los movimientos chicos se acumulen hasta el umbral.
      if (Math.abs(delta) < MIN_DELTA) return

      last = y
      setCollapsed(delta > 0)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname])

  return collapsed
}
