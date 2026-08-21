/**
 * Profundidad de modal: mientras hay un sheet o dialog abierto, la pantalla de
 * atrás retrocede en Z, como la tarjeta que iOS empuja al fondo.
 *
 * El transform **no** puede ir en un ancestro común. La app scrollea en
 * `window`, así que el div raíz del shell mide el alto del documento entero;
 * un transform ahí convertiría a `.tab-dock` (`fixed`) en su hijo posicionado
 * y su `bottom` dejaría de ser el borde de la pantalla. El CSS lo aplica en
 * paralelo a `.nav-bar`, `main` y `.tab-dock` — ninguno de los tres tiene algo
 * `fixed` adentro, y transformar un `sticky`/`fixed` a sí mismo es válido: lo
 * que rompe es tener un *ancestro* transformado.
 *
 * Para que los tres retrocedan como una sola pieza comparten punto de fuga.
 * `transform-origin` se resuelve contra la caja propia, así que `main` necesita
 * saber cuánto se scrolleó. Se lee **una vez** al abrir: con el modal abierto
 * el scroll está bloqueado, así que no hay nada que seguir por frame.
 *
 * Refcount explícito en vez de observar el DOM: `register-pwa.ts:isBusy()` ya
 * muestra lo frágil que es preguntarle al documento si hay un modal abierto.
 */

const ATTR = 'data-modal'

/** Igual que `--dur-2`. Duplicado como en `TabBar`: el timer no lee CSS. */
const EXIT_MS = 320

let open = 0
let clearTimer: ReturnType<typeof setTimeout> | undefined

function rootElement(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.documentElement
}

function reducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** Un modal más en pantalla. Idempotente por refcount (sheets anidados). */
export function pushModal() {
  open += 1
  if (open > 1) return

  const root = rootElement()
  if (!root || reducedMotion()) return

  if (clearTimer !== undefined) {
    clearTimeout(clearTimer)
    clearTimer = undefined
  }

  const scrollY = typeof window === 'undefined' ? 0 : window.scrollY
  root.style.setProperty('--modal-scroll', `${scrollY}px`)
  root.setAttribute(ATTR, '1')
}

/**
 * Un modal menos. Al cerrar el último el atributo pasa a `'0'` (la transición
 * de vuelta) y recién después se borra: el CSS solo declara el `transform` de
 * reposo mientras el atributo existe, así que borrarlo es lo que deja a `main`
 * con `transform: none` y sin ser containing block de nada.
 */
export function popModal() {
  open = Math.max(0, open - 1)
  if (open > 0) return

  const root = rootElement()
  if (!root || !root.hasAttribute(ATTR)) return

  root.setAttribute(ATTR, '0')
  clearTimer = setTimeout(() => {
    clearTimer = undefined
    // Se abrió otro mientras salía: `pushModal` ya lo dejó en '1'
    if (open > 0) return
    const node = rootElement()
    node?.removeAttribute(ATTR)
    node?.style.removeProperty('--modal-scroll')
  }, EXIT_MS)
}

/** Solo para tests: el refcount es estado de módulo. */
export function resetModalDepth() {
  if (clearTimer !== undefined) clearTimeout(clearTimer)
  clearTimer = undefined
  open = 0
  const root = rootElement()
  root?.removeAttribute(ATTR)
  root?.style.removeProperty('--modal-scroll')
}
