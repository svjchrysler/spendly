import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/format'

type Slice = {
  id: string
  name: string
  color: string
  total: number
}

function DonutTooltip({
  active,
  payload,
}: Readonly<{
  active?: boolean
  payload?: { name?: string; value?: number; payload?: { pct: number } }[]
}>) {
  if (!active || !payload?.[0]) return null
  const item = payload[0]
  const pct = item.payload?.pct ?? 0
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">{item.name}</p>
      <p className="font-semibold tabular-nums">
        {formatCurrency(Number(item.value))}
        <span className="ml-1.5 font-medium text-muted-foreground">
          {pct < 1 && pct > 0 ? pct.toFixed(1) : Math.round(pct)}%
        </span>
      </p>
    </div>
  )
}

export function CategoryDonut({
  data,
  total,
}: Readonly<{
  data: Slice[]
  total: number
}>) {
  if (data.length === 0 || total <= 0) return null

  const sorted = [...data].sort((a, b) => b.total - a.total)
  const top = sorted.slice(0, 5)
  const rest = sorted.slice(5)
  const restTotal = rest.reduce((sum, item) => sum + item.total, 0)
  const slices = [
    ...top.map((item) => ({
      ...item,
      pct: (item.total / total) * 100,
    })),
    ...(restTotal > 0
      ? [
          {
            id: 'otros',
            name: 'Otros',
            color: 'var(--chart-5)',
            total: restTotal,
            pct: (restTotal / total) * 100,
          },
        ]
      : []),
  ]

  return (
    <section className="space-y-3">
      <p className="stat-label">Mix de categorías</p>
      <div className="flex items-center gap-4">
        <div className="relative size-36 shrink-0 sm:size-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="total"
                nameKey="name"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="var(--background)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Total
            </p>
            <p className="max-w-[5.5rem] truncate text-center text-sm font-semibold tabular-nums tracking-tight">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {slices.map((slice) => (
            <li key={slice.id} className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="truncate text-xs font-medium tracking-tight">
                  {slice.name}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {Math.round(slice.pct)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
