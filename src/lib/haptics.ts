/**
 * Feedback háptico para acciones que cambian datos.
 *
 * Android/Chrome lo implementa; iOS Safari no expone `vibrate` y queda en
 * no-op silencioso (ahí el feedback lo dan el sheet y el toast). Llamar solo
 * desde handlers de gesto: sin interacción previa el browser lo descarta.
 */
function vibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  try {
    navigator.vibrate(pattern)
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
  vibrate([12, 40, 18])
}

/** Acción destructiva confirmada: gasto eliminado. */
export function warnFeedback() {
  vibrate([22, 55, 22])
}
