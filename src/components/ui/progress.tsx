import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Barra de progreso. Reemplaza las utilidades `.bar-track` / `.bar-fill`.
 *
 * `tint` existe porque la asignación por categoría pinta cada barra con el
 * color de su categoría, que no es un token del tema.
 *
 * Al montar crece desde cero: la barra se lee como "esta parte del total" en
 * vez de aparecer ya llena, que es una mancha de color sin información. Los
 * cambios posteriores los cubre la misma transición de ancho.
 */
export function Progress({
  value,
  tone = 'default',
  tint,
  size = 'md',
  className,
  label,
}: Readonly<{
  /** 0..1 */
  value: number
  tone?: 'default' | 'destructive'
  tint?: string
  size?: 'sm' | 'md'
  className?: string
  label?: string
}>) {
  const pct = Math.min(Math.max(value, 0), 1) * 100
  const [grown, setGrown] = useState(false)

  // rAF y no un efecto pelado: el ancho tiene que pintarse en 0 una vez para
  // que la transición tenga desde dónde salir.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'w-full overflow-hidden rounded-full bg-fill-quaternary',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out-expo',
          !tint && (tone === 'destructive' ? 'bg-destructive' : 'bg-primary'),
        )}
        style={{ width: `${grown ? pct : 0}%`, backgroundColor: tint }}
      />
    </div>
  )
}
