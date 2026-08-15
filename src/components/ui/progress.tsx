import { cn } from '@/lib/utils'

/**
 * Barra de progreso. Reemplaza las utilidades `.bar-track` / `.bar-fill`.
 *
 * `tint` existe porque la asignación por categoría pinta cada barra con el
 * color de su categoría, que no es un token del tema.
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
        style={{ width: `${pct}%`, backgroundColor: tint }}
      />
    </div>
  )
}
