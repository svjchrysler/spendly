import { useCountUp } from '@/hooks/useCountUp'
import { formatCurrency } from '@/lib/format'
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

/**
 * Monto que viaja hasta su valor en vez de reemplazarse.
 *
 * El texto animado va `aria-hidden` con el valor final en un `sr-only` al
 * lado: un lector de pantalla no tiene por qué escuchar los cuarenta pasos
 * intermedios. Requiere `tabular-nums` (lo trae de fábrica) o el ancho baila
 * dígito a dígito.
 */
export function AnimatedAmount({
  value,
  format = formatCurrency,
  from = 0,
  duration,
  className,
}: AnimatedAmountProps) {
  const display = useCountUp(value, { from, duration })

  return (
    <>
      <span className={cn('tabular-nums', className)} aria-hidden>
        {format(display)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </>
  )
}
