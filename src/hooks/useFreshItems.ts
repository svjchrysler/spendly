import { useEffect, useRef, useState } from 'react'

const EMPTY: ReadonlySet<string> = new Set()

type FreshOptions = {
  /** Cuánto dura el tinte de la fila */
  ttl?: number
  /**
   * Al cambiar, la lista se vuelve a tomar como línea de base sin marcar nada.
   * Es el mes: saltar de septiembre a agosto trae 40 filas que no "llegaron",
   * estaban ahí.
   */
  resetKey?: string
  /**
   * Tope de llegadas simultáneas que cuentan como novedad. Guardar un gasto
   * agrega una fila; si aparecen diez de golpe fue una carga, no un evento, y
   * tintar media pantalla no informa nada.
   */
  maxBurst?: number
}

/**
 * Ids que aparecieron después del primer render.
 *
 * Sirve para marcar la fila que acabás de guardar (o la que entró por
 * realtime desde otro dispositivo): sin señal, un gasto nuevo se pierde entre
 * veinte filas iguales.
 */
export function useFreshItems(
  ids: readonly string[],
  { ttl = 1200, resetKey, maxBurst = 3 }: FreshOptions = {},
) {
  const seen = useRef<Set<string> | null>(null)
  const lastReset = useRef(resetKey)
  const idsRef = useRef(ids)
  idsRef.current = ids
  const [fresh, setFresh] = useState<ReadonlySet<string>>(EMPTY)
  const key = ids.join('|')

  useEffect(() => {
    const current = idsRef.current
    const reset = seen.current === null || lastReset.current !== resetKey
    lastReset.current = resetKey

    if (reset) {
      seen.current = new Set(current)
      setFresh(EMPTY)
      return
    }

    const added = current.filter((id) => !seen.current?.has(id))
    // Reemplazar el set en vez de acumular: los ids borrados no quedan colgados
    seen.current = new Set(current)
    if (added.length === 0 || added.length > maxBurst) return

    setFresh(new Set(added))
    const timer = window.setTimeout(() => setFresh(EMPTY), ttl)
    return () => window.clearTimeout(timer)
  }, [key, ttl, resetKey, maxBurst])

  return fresh
}
