import { getCategoryIcon } from '@/lib/category-icons'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CategoryAllocationProps {
  data: { id: string; name: string; color: string; icon: string; total: number }[]
  total: number
  limit?: number
}

export function CategoryAllocation({ data, total, limit = 6 }: CategoryAllocationProps) {
  if (data.length === 0) {
    return (
      <div className="data-panel space-y-3">
        <p className="stat-label">Por categoría</p>
        <p className="text-sm text-muted-foreground">Sin gastos este mes</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.total - a.total)
  const visible = sorted.slice(0, limit)
  const hidden = sorted.slice(limit)
  const hiddenTotal = hidden.reduce((sum, item) => sum + item.total, 0)

  return (
    <section className="data-panel space-y-5">
      <p className="stat-label">Por categoría</p>

      <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
        {visible.map((item) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0
          if (pct < 0.5) return null
          return (
            <div
              key={item.id}
              className="h-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              title={`${item.name} ${Math.round(pct)}%`}
            />
          )
        })}
        {hiddenTotal > 0 ? (
          <div
            className="h-full bg-muted-foreground/30"
            style={{ width: `${total > 0 ? (hiddenTotal / total) * 100 : 0}%` }}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        {visible.map((item, index) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0
          const Icon = getCategoryIcon(item.icon)
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/20',
                index === 0 && 'bg-muted/10',
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary"
              >
                <Icon className="size-3.5" style={{ color: item.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(item.total)}
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {hidden.length > 0 ? (
          <p className="px-2 text-xs text-muted-foreground">
            +{hidden.length} categorías más · {formatCurrency(hiddenTotal)}
          </p>
        ) : null}
      </div>
    </section>
  )
}
