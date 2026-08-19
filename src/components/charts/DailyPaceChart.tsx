import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRevealOnEnter } from '@/hooks/useRevealOnEnter'

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
  const reducedMotion = useReducedMotion()
  // El chart vive bajo el fold: la entrada espera a que se lo mire
  const revealRef = useRevealOnEnter<HTMLElement>()
  const hasBudget = budget != null && budget > 0
  const series = hasBudget
    ? data.map((point) => ({ ...point, budget: budget }))
    : data

  // El punteado ya dice "este es el techo"; el punto dice "acá lo cruzaste",
  // que es el único dato accionable del chart. Sin presupuesto no hay nada
  // que marcar y no se renderiza.
  const crossing = hasBudget
    ? data.find((point) => point.cumulative > budget)
    : undefined

  const chartMargins = {
    top: 8,
    right: isDesktop ? 8 : 4,
    left: isDesktop ? 0 : -12,
    bottom: 0,
  }

  return (
    <section ref={revealRef} className="space-y-4 border-t border-border/70 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="stat-label">Ritmo del mes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Barras = gasto del día · línea = acumulado
            {hasBudget ? ' · punteado = presupuesto' : ''}
            {crossing ? ' · el punto marca dónde lo cruzaste' : ''}
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
              isAnimationActive={!reducedMotion}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="var(--foreground)"
              strokeWidth={2}
              dot={false}
              name="Acumulado"
              isAnimationActive={!reducedMotion}
              animationDuration={800}
              animationEasing="ease-out"
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
                // Sin animar a propósito: el presupuesto es la referencia fija
                // contra la que se dibuja el acumulado, no un dato que llega
                isAnimationActive={false}
              />
            ) : null}
            {crossing ? (
              <ReferenceDot
                x={crossing.day}
                y={crossing.cumulative}
                r={4}
                fill="var(--chart-4)"
                stroke="var(--background)"
                strokeWidth={2}
                label={{
                  value: `día ${crossing.day}`,
                  position: 'top',
                  fontSize: 10,
                  fill: 'var(--chart-4)',
                }}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
