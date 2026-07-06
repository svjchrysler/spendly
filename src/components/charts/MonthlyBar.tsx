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

interface MonthlyBarProps {
  data: { label: string; total: number }[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 capitalize text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{formatCurrency(Number(payload[0].value))}</p>
    </div>
  )
}

export function MonthlyBar({ data }: MonthlyBarProps) {
  const isDesktop = useIsDesktop()
  const maxTotal = Math.max(...data.map((item) => item.total), 1)
  const currentIndex = data.length - 1

  const chartMargins = {
    top: 8,
    right: isDesktop ? 8 : 0,
    left: isDesktop ? 0 : -12,
    bottom: 0,
  }

  return (
    <section className="data-panel space-y-5">
      <div className="flex items-end justify-between gap-3">
        <p className="stat-label">Últimos 6 meses</p>
        <p className="text-xs text-muted-foreground">
          Máx. {formatCurrencyCompact(maxTotal)}
        </p>
      </div>
      <div className="h-52 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={isDesktop ? 32 : 22} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            {isDesktop ? (
              <YAxis
                stroke="#737373"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCurrencyCompact(Number(v))}
                width={60}
              />
            ) : null}
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={index === currentIndex ? '#5cdb95' : '#404040'}
                  fillOpacity={index === currentIndex ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
