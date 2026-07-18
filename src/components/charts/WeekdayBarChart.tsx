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

type WeekdayPoint = {
  label: string
  total: number
  count: number
}

function WeekdayTooltip({
  active,
  payload,
}: Readonly<{
  active?: boolean
  payload?: { payload?: WeekdayPoint; value?: number }[]
}>) {
  if (!active || !payload?.[0]?.payload) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">{point.label}</p>
      <p className="font-semibold tabular-nums">{formatCurrency(point.total)}</p>
      <p className="mt-0.5 text-muted-foreground">{point.count} movimientos</p>
    </div>
  )
}

export function WeekdayBarChart({
  data,
}: Readonly<{
  data: WeekdayPoint[]
}>) {
  const isDesktop = useIsDesktop()
  const peak = Math.max(...data.map((item) => item.total), 0)

  return (
    <section className="space-y-4 border-t border-border/70 pt-5">
      <p className="stat-label">Por día de la semana</p>
      <div className="h-48 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: isDesktop ? 12 : 4, left: 0, bottom: 0 }}
            barSize={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrencyCompact(Number(value))}
              hide={!isDesktop}
            />
            <YAxis
              type="category"
              dataKey="label"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip content={<WeekdayTooltip />} cursor={{ fill: 'color-mix(in oklab, var(--foreground) 6%, transparent)' }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
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
