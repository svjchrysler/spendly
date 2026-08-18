import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Listas agrupadas inset, el primitivo central del rediseño iOS.
 *
 * El inset lateral lo da el padding del `<main>` (1rem), que coincide con el
 * margen estándar de iOS — la lista no agrega el suyo o quedaría doble.
 *
 * El separador indentado hasta el borde del label es la razón por la que esto
 * tiene que ser un componente y no un par de clases: `divide-y` no puede
 * indentar, y ese detalle es de los que más delatan una app web.
 */

export function List({
  className,
  children,
  ...props
}: Readonly<ComponentProps<'div'>>) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {children}
    </div>
  )
}

export function ListSection({
  header,
  headerTrailing,
  footer,
  stagger = false,
  className,
  children,
}: Readonly<{
  header?: ReactNode
  headerTrailing?: ReactNode
  footer?: ReactNode
  /**
   * Cascada de entrada de las filas. Solo para listas cortas y cerradas
   * (un top de 5, los meses del historial): en un listado largo la última
   * fila llegaría tarde y en uno con swipe pelea con el gesto.
   */
  stagger?: boolean
  className?: string
  children: ReactNode
}>) {
  return (
    <section className={cn('min-w-0', className)}>
      {header ? (
        <div className="flex items-baseline justify-between gap-3 px-4 pb-1.5">
          <h3 className="list-section-header truncate">{header}</h3>
          {headerTrailing}
        </div>
      ) : null}
      <div className={cn('list-group', stagger && 'stagger')}>{children}</div>
      {footer ? (
        <p className="px-4 pt-1.5 text-footnote text-label-secondary">{footer}</p>
      ) : null}
    </section>
  )
}

type ListRowProps = Readonly<{
  leading?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  chevron?: boolean
  onPress?: () => void
  to?: string
  destructive?: boolean
  loading?: boolean
  /** Override del inset del separador cuando el leading no mide lo esperado */
  separatorInset?: string
  className?: string
  children?: ReactNode
}>

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  chevron = false,
  onPress,
  to,
  destructive = false,
  loading = false,
  separatorInset,
  className,
  children,
}: ListRowProps) {
  const tappable = Boolean(onPress || to)
  const inset = separatorInset ?? (leading ? '3.75rem' : '1rem')

  const body = loading ? (
    <>
      {leading ? <span className="list-row__leading">{leading}</span> : null}
      <span className="list-row__body gap-1.5">
        <Skeleton className="h-3.5 w-28" />
        {subtitle === undefined ? null : <Skeleton className="h-3 w-16" />}
      </span>
      {trailing === undefined ? null : <Skeleton className="h-3.5 w-14" />}
    </>
  ) : (
    <>
      {leading ? <span className="list-row__leading">{leading}</span> : null}
      {children ?? (
        <span className="list-row__body">
          <span
            className={cn(
              'truncate text-body',
              destructive ? 'text-destructive' : 'text-label',
            )}
          >
            {title}
          </span>
          {subtitle ? (
            <span className="truncate text-subhead text-label-secondary">{subtitle}</span>
          ) : null}
        </span>
      )}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
      {chevron ? (
        <ChevronRight className="list-row__chevron size-4" aria-hidden />
      ) : null}
    </>
  )

  const classes = cn('list-row', tappable && 'list-row--tappable', className)
  const style = { '--row-inset': inset } as CSSProperties

  if (to) {
    return (
      <Link to={to} className={classes} style={style}>
        {body}
      </Link>
    )
  }

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={classes} style={style}>
        {body}
      </button>
    )
  }

  return (
    <div className={classes} style={style}>
      {body}
    </div>
  )
}
