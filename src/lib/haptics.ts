/**
 * Feedback háptico para acciones que cambian datos.
 *
 * Android/Chrome implementa `navigator.vibrate`. iOS Safari no, pero desde
 * iOS 18 el `<input type="checkbox" switch>` da el toque del Taptic Engine al
 * conmutar, igual que un UISwitch — también cuando el click llega por su
 * `<label>`. Se arma uno descartable fuera de pantalla y se le hace click: es
 * la única puerta al háptico que tiene una PWA en iPhone. Antes de iOS 18 el
 * atributo se ignora y queda en no-op silencioso.
 *
 * Llamar solo desde handlers de gesto: sin interacción previa el browser lo
 * descarta.
 */
const TICK_GAP_MS = 110

const hasVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
const isTouch =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches

function switchTick() {
  const label = document.createElement('label')
  label.ariaHidden = 'true'
  label.style.display = 'none'
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  label.appendChild(input)
  document.head.appendChild(label)
  label.click()
  label.remove()
}

/** `ticks`: cuántos toques secos da iOS, que no tiene patrones de duración */
function vibrate(pattern: number | number[], ticks = 1) {
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') return
  try {
    if (hasVibrate) {
      navigator.vibrate(pattern)
      return
    }
    if (!isTouch) return
    switchTick()
    for (let i = 1; i < ticks; i += 1) window.setTimeout(switchTick, i * TICK_GAP_MS)
  } catch {
    /* algunos browsers lanzan si la política de gesto no se cumplió */
  }
}

/** Toque seco: abrir el form, disparar un refresh. */
export function tapFeedback() {
  vibrate(10)
}

/** Confirmación: gasto guardado. */
export function successFeedback() {
  vibrate([12, 40, 18], 2)
}

/** Acción destructiva confirmada: gasto eliminado. */
export function warnFeedback() {
  vibrate([22, 55, 22], 3)
}
