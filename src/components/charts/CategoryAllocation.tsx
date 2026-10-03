import type { CSSProperties } from 'react'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { Progress } from '@/components/ui/progress'
import { useCategoryColor } from '@/hooks/useCategoryColor'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CategoryAllocationProps {
  data: { id: string; name: string; color: string; icon: string; total: number }[]
  total: number
  limit?: number
  className?: string
}

function formatPct(pct: number) {
  return `${pct < 1 && pct > 0 ? pct.toFixed(1) : Math.round(pct)}%`
}

/**
 * Reparto del mes como lista agrupada: cada categoría con su ícono, el monto
 * y una barra del color de la categoría — que es además la leyenda del donut
 * en Análisis.
 */
export function CategoryAllocation({
  data,
  total,
  limit,
  className,
}: Readonly<CategoryAllocationProps>) {
  const categoryColor = useCategoryColor()

  if (data.length === 0) {
    return (
      <div className={cn('list-group reveal', className)}>
        <p className="list-row text-callout text-label-secondary">Sin gastos este mes</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.total - a.total)
  const visible = limit == null ? sorted : sorted.slice(0, limit)
  const hidden = limit == null ? [] : sorted.slice(limit)
  const hiddenTotal = hidden.reduce((sum, item) => sum + item.total, 0)
  const rowStyle = { '--row-inset': '3.75rem' } as CSSProperties

  return (
    // `stagger`: el ranking se construye de arriba hacia abajo y se lee como
    // orden, no como filas que aparecieron juntas
    <div className={cn('list-group stagger', className)}>
      {visible.map((item) => {
        const pct = total > 0 ? (item.total / total) * 100 : 0
        return (
          <div key={item.id} className="list-row" style={rowStyle}>
            <CategoryIcon icon={item.icon} color={item.color} name={item.name} size="sm" />
            <div className="list-row__body gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-body text-label">{item.name}</span>
                <span className="shrink-0 font-ledger text-body font-semibold text-label">
                  {formatCurrency(item.total)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Progress
                  className="flex-1"
                  value={Math.max(pct, 1) / 100}
                  size="sm"
                  tint={categoryColor(item.color)}
                  label={item.name}
                />
                <span className="w-10 shrink-0 text-right font-ledger text-footnote text-label-secondary">
                  {formatPct(pct)}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      {hidden.length > 0 ? (
        <div className="list-row text-subhead text-label-secondary">
          <span className="flex-1">
            +{hidden.length} {hidden.length === 1 ? 'categoría' : 'categorías'} más
          </span>
          <span className="font-ledger">{formatCurrency(hiddenTotal)}</span>
        </div>
      ) : null}
    </div>
  )
}
