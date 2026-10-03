import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { AnimatedAmount } from '@/components/ui/animated-amount'
import { formatCurrency } from '@/lib/format'
import { useCategoryColor } from '@/hooks/useCategoryColor'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRevealOnEnter } from '@/hooks/useRevealOnEnter'

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
    <div className="rounded-xl bg-popover px-3 py-2 text-footnote shadow-[0_8px_24px_-8px_var(--shadow-elevated)] ring-1 ring-foreground/5">
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
  const categoryColor = useCategoryColor()
  const reducedMotion = useReducedMotion()
  // El chart vive bajo el fold: la entrada espera a que se lo mire
  const revealRef = useRevealOnEnter<HTMLElement>()
  if (data.length === 0 || total <= 0) return null

  const sorted = [...data].sort((a, b) => b.total - a.total)
  const top = sorted.slice(0, 5)
  const rest = sorted.slice(5)
  const restTotal = rest.reduce((sum, item) => sum + item.total, 0)
  const slices = [
    ...top.map((item) => ({
      ...item,
      // 'Otros' usa var(--chart-5), que ya es theme-aware: el resolver lo
      // deja pasar intacto porque no parsea como hex.
      color: categoryColor(item.color) ?? item.color,
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

  // Solo el anillo con el total al centro: la leyenda es la lista de
  // categorías de abajo, que ya lleva el color, el monto y el porcentaje
  return (
    <section ref={revealRef} className="flex justify-center py-1">
      <div className="relative size-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="name"
              innerRadius="70%"
              outerRadius="96%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              // El anillo se barre: la torta se lee como reparto de un total
              isAnimationActive={!reducedMotion}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {slices.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-footnote text-label-secondary">Total</p>
          {/* El centro cuenta mientras el anillo barre: las dos lecturas del
              mismo dato llegan juntas */}
          <p className="max-w-[7.5rem] truncate text-center font-ledger text-headline text-label">
            <AnimatedAmount value={total} duration={700} />
          </p>
        </div>
      </div>
    </section>
  )
}
