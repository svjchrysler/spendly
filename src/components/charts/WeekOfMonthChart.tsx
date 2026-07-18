import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format'
import { useIsDesktop } from '@/hooks/useMediaQuery'

type WeekPoint = {
  label: string
  range: string
  total: number
  count: number
}

function WeekTooltip({
  active,
  payload,
}: Readonly<{
  active?: boolean
  payload?: { payload?: WeekPoint }[]
}>) {
  if (!active || !payload?.[0]?.payload) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">
        {point.label} · días {point.range}
      </p>
      <p className="font-semibold tabular-nums">{formatCurrency(point.total)}</p>
      <p className="mt-0.5 text-muted-foreground">{point.count} movimientos</p>
    </div>
  )
}

export function WeekOfMonthChart({
  data,
}: Readonly<{
  data: WeekPoint[]
}>) {
  const isDesktop = useIsDesktop()
  const peak = Math.max(...data.map((item) => item.total), 0)

  return (
    <section className="space-y-4 border-t border-border/70 pt-5">
      <p className="stat-label">Por semana del mes</p>
      <div className="h-44 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: isDesktop ? 8 : 0,
              left: isDesktop ? 0 : -12,
              bottom: 0,
            }}
            barSize={isDesktop ? 36 : 28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
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
            <Tooltip content={<WeekTooltip />} cursor={{ fill: 'color-mix(in oklab, var(--foreground) 6%, transparent)' }} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={
                    entry.total === peak && peak > 0
                      ? 'var(--chart-1)'
                      : 'var(--chart-5)'
                  }
                  fillOpacity={entry.total === peak && peak > 0 ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
