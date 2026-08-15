/**
 * Un único listener de scroll para toda la app.
 *
 * Había dos (`useTabBarCollapse`, `useScrollRestoration`) y el rediseño pedía
 * un tercero para el large title. Cada uno con su propio rAF significa medir
 * `scrollY` tres veces por frame y forzar reflow otras tantas.
 *
 * El documento scrollea en `window` — no hay contenedor interno.
 */

export type ScrollState = {
  y: number
  /** Delta contra la última medición emitida */
  dy: number
  direction: 1 | -1 | 0
  atTop: boolean
}

type Listener = (state: ScrollState) => void

const listeners = new Set<Listener>()
let frame = 0
let last = 0
let attached = false

function measure() {
  frame = 0
  const y = window.scrollY
  const dy = y - last
  last = y
  const state: ScrollState = {
    y,
    dy,
    direction: dy > 0 ? 1 : dy < 0 ? -1 : 0,
    atTop: y <= 0,
  }
  for (const listener of listeners) listener(state)
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(measure)
}

/**
 * Devuelve la baja. El listener recibe el estado en cada frame en que hubo
 * scroll, nunca más de una vez por frame.
 */
export function subscribeScroll(listener: Listener): () => void {
  listeners.add(listener)

  if (!attached) {
    last = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    attached = true
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    window.removeEventListener('scroll', onScroll)
    attached = false
    if (frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}

export function getScrollY(): number {
  return window.scrollY
}
