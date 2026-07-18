import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format'
import { useIsDesktop } from '@/hooks/useMediaQuery'

type PacePoint = {
  day: string
  daily: number
  cumulative: number
  budget?: number
}

function PaceTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean
  payload?: { dataKey?: string | number; value?: number; color?: string }[]
  label?: string
}>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 text-muted-foreground">Día {label}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          if (entry.dataKey === 'budget' || entry.value == null) return null
          const name = entry.dataKey === 'cumulative' ? 'Acumulado' : 'Del día'
          return (
            <p key={String(entry.dataKey)} className="flex justify-between gap-4 font-semibold tabular-nums">
              <span className="font-medium text-muted-foreground">{name}</span>
              <span style={{ color: entry.color }}>{formatCurrency(Number(entry.value))}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

export function DailyPaceChart({
  data,
  budget,
}: Readonly<{
  data: PacePoint[]
  budget: number | null
}>) {
  const isDesktop = useIsDesktop()
  const hasBudget = budget != null && budget > 0
  const series = hasBudget
    ? data.map((point) => ({ ...point, budget: budget }))
    : data

  const chartMargins = {
    top: 8,
    right: isDesktop ? 8 : 4,
    left: isDesktop ? 0 : -12,
    bottom: 0,
  }

  return (
    <section className="space-y-4 border-t border-border/70 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="stat-label">Ritmo del mes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Barras = gasto del día · línea = acumulado
            {hasBudget ? ' · punteado = presupuesto' : ''}
          </p>
        </div>
      </div>
      <div className="h-52 sm:h-56 lg:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={isDesktop ? 18 : 12}
            />
            {isDesktop ? (
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrencyCompact(Number(value))}
                width={56}
              />
            ) : null}
            <Tooltip content={<PaceTooltip />} />
            <Area
              type="monotone"
              dataKey="daily"
              fill="color-mix(in oklab, var(--chart-1) 22%, transparent)"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              name="Del día"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="var(--foreground)"
              strokeWidth={2}
              dot={false}
              name="Acumulado"
              isAnimationActive={false}
            />
            {hasBudget ? (
              <Line
                type="monotone"
                dataKey="budget"
                stroke="var(--chart-4)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
                name="Presupuesto"
                isAnimationActive={false}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
