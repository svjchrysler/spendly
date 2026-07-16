import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CategoryAllocationProps {
  data: { id: string; name: string; color: string; icon: string; total: number }[]
  total: number
  limit?: number
  className?: string
}

export function CategoryAllocation({
  data,
  total,
  limit,
  className,
}: Readonly<CategoryAllocationProps>) {
  if (data.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <p className="stat-label">Asignación</p>
        <p className="text-sm text-muted-foreground">Sin gastos este mes</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.total - a.total)
  const visible = limit == null ? sorted : sorted.slice(0, limit)
  const hidden = limit == null ? [] : sorted.slice(limit)
  const hiddenTotal = hidden.reduce((sum, item) => sum + item.total, 0)

  return (
    <section className={cn('space-y-4', className)}>
      <p className="stat-label">Asignación</p>

      <div className="space-y-4">
        {visible.map((item, index) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0
          return (
            <div
              key={item.id}
              className="space-y-2"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="size-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: item.color, color: item.color }}
                    aria-hidden
                  />
                  <span className="truncate text-sm font-medium tracking-tight">
                    {item.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-baseline gap-2.5">
                  <span className="text-sm font-semibold tabular-nums tracking-tight">
                    {formatCurrency(item.total)}
                  </span>
                  <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                    {pct < 1 && pct > 0 ? pct.toFixed(1) : Math.round(pct)}%
                  </span>
                </div>
              </div>
              <div className="bar-track h-1.5">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.max(pct, 1)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          )
        })}

        {hidden.length > 0 ? (
          <div className="flex items-baseline justify-between gap-3 pt-1 text-xs text-muted-foreground">
            <span>+{hidden.length} categorías más</span>
            <span className="tabular-nums">{formatCurrency(hiddenTotal)}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
