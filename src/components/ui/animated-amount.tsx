import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/useCountUp'
import { formatCurrency } from '@/lib/format'
import { isNavigating } from '@/hooks/useRouteTransition'
import { cn } from '@/lib/utils'

type AnimatedAmountProps = Readonly<{
  value: number
  /** Por defecto la moneda de la app; `formatCurrencyCompact` para ejes/chips */
  format?: (value: number) => string
  /** Punto de partida del conteo. `0` (default) lo cuenta al aparecer. */
  from?: number
  duration?: number
  className?: string
}>

type Trend = { dir: 'up' | 'down'; seq: number }

/**
 * Monto que viaja hasta su valor en vez de reemplazarse.
 *
 * El texto animado va `aria-hidden` con el valor final en un `sr-only` al
 * lado: un lector de pantalla no tiene por qué escuchar los cuarenta pasos
 * intermedios. Requiere `tabular-nums` (lo trae de fábrica) o el ancho baila
 * dígito a dígito.
 *
 * El conteo dice *cuánto* cambió (la duración escala con el delta, ver
 * `useCountUp`) y el tinte dice *para qué lado*, sin agregar flecha ni signo.
 */
export function AnimatedAmount({
  value,
  format = formatCurrency,
  from = 0,
  duration,
  className,
}: AnimatedAmountProps) {
  /*
    Llegando de otra pantalla el monto ya viene morfeando por view transition
    (`view-transition-name: month-total`). Contarlo además desde cero serían
    dos animaciones peleando por el mismo número, así que ahí arranca puesto.
  */
  const [origin] = useState(() => (isNavigating() ? value : from))
  const display = useCountUp(value, { from: origin, duration })

  const previous = useRef(value)
  const seq = useRef(0)
  const [trend, setTrend] = useState<Trend | null>(null)

  useEffect(() => {
    const before = previous.current
    previous.current = value
    if (before === value) return
    // `seq` remonta el span: sin cambio de key un segundo cambio en la misma
    // dirección no volvería a disparar el keyframe.
    seq.current += 1
    setTrend({ dir: value > before ? 'up' : 'down', seq: seq.current })
  }, [value])

  return (
    <>
      <span
        key={trend?.seq ?? 0}
        className={cn('amount-trend tabular-nums', className)}
        data-trend={trend?.dir}
        aria-hidden
      >
        {format(display)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </>
  )
}
