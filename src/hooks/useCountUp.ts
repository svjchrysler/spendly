import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Misma curva que `--ease-out-expo`, aproximada para interpolar números. */
function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t)
}

type CountUpOptions = {
  duration?: number
  /** Valor del primer render. `0` hace que el monto se cuente al aparecer. */
  from?: number
}

/**
 * Interpola un número hacia su valor nuevo.
 *
 * El punto no es el efecto: es que el monto **cambie a la vista**. Al guardar
 * un gasto o al saltar de mes, el total viejo viaja hasta el nuevo y se lee
 * cuánto se movió; un reemplazo seco solo deja una cifra distinta.
 *
 * Devuelve el valor intermedio, así que conviene usarlo en una hoja del árbol
 * (`AnimatedAmount`) y no en una página: son ~40 renders por transición.
 */
export function useCountUp(value: number, { duration = 700, from = 0 }: CountUpOptions = {}) {
  const reduced = useReducedMotion()
  const safeValue = Number.isFinite(value) ? value : 0
  const [display, setDisplay] = useState(from)
  // Arranca donde quedó el frame anterior: una interrupción no vuelve a cero
  const currentRef = useRef(display)

  useEffect(() => {
    if (reduced || currentRef.current === safeValue) {
      currentRef.current = safeValue
      setDisplay(safeValue)
      return
    }

    const start = performance.now()
    const origin = currentRef.current
    const delta = safeValue - origin
    let frame = 0

    /*
      Un cambio de 3 Bs y uno de 3.000 no pueden tardar lo mismo: la duración
      es parte de la lectura de "cuánto se movió". Se escala sobre el `duration`
      que llega por prop, así que quien lo baja a propósito (el total filtrado,
      que se recalcula tecla a tecla) conserva su techo.
    */
    const ratio = Math.min(Math.abs(delta) / Math.max(Math.abs(origin), 1), 1)
    const span = Math.round(duration * (0.45 + 0.85 * ratio))

    const tick = (now: number) => {
      const progress = Math.min((now - start) / span, 1)
      const next = progress === 1 ? safeValue : origin + delta * easeOutExpo(progress)
      currentRef.current = next
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [safeValue, duration, reduced])

  return display
}
