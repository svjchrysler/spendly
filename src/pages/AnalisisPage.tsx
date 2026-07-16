import { lazy, Suspense, type ReactNode } from 'react'
import {
  AnalisisPageSkeleton,
  CategoryAllocationSkeleton,
  ChartSkeleton,
} from '@/components/layout/skeletons'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useMonthlyHistory, useMonthlyStats } from '@/hooks/useMonthlyStats'
import { capitalize, formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

const MonthlyBar = lazy(() =>
  import('@/components/charts/MonthlyBar').then((module) => ({
    default: module.MonthlyBar,
  })),
)

function TrendStrip({
  history,
}: Readonly<{ history: { label: string; total: number }[] }>) {
  const last = history.at(-1)
  const previous = history.at(-2)
  const average = history.reduce((sum, item) => sum + item.total, 0) / history.length
  const peak = history.reduce((max, item) => (item.total > max.total ? item : max), history[0])

  let deltaCell: ReactNode = <p className="metric-cell-value">—</p>
  if (last && previous && previous.total > 0) {
    const delta = ((last.total - previous.total) / previous.total) * 100
    const rising = delta > 0
    deltaCell = (
      <p
        className={cn(
          'metric-cell-value',
          rising ? 'text-destructive' : 'text-primary',
        )}
      >
        {rising ? '+' : ''}
        {Math.round(delta)}%
      </p>
    )
  }

  return (
    <section className="grid grid-cols-3 gap-x-4 gap-y-1 border-b border-border/70 pb-5">
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Promedio mensual</p>
        <p className="metric-cell-value">{formatCurrency(average)}</p>
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Vs. mes anterior</p>
        {deltaCell}
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Mes más alto</p>
        <p className="metric-cell-value">
          {formatCurrency(peak.total)}
          <span className="ml-1.5 text-xs font-medium capitalize text-muted-foreground">
            {capitalize(peak.label)}
          </span>
        </p>
      </div>
    </section>
  )
}

export function AnalisisPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []

  if (statsLoading && historyLoading) {
    return <AnalisisPageSkeleton />
  }

  let historyPanel: ReactNode = (
    <p className="py-8 text-sm text-muted-foreground">Sin historial aún</p>
  )
  if (historyLoading) {
    historyPanel = <ChartSkeleton />
  } else if (history && history.length > 0) {
    historyPanel = (
      <Suspense fallback={<ChartSkeleton />}>
        <MonthlyBar data={history} />
      </Suspense>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8">
      <MonthMasthead eyebrow="Análisis" />

      {history && history.length > 1 ? <TrendStrip history={history} /> : null}

      <div className="grid gap-8 pt-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
        <section className="min-w-0">{historyPanel}</section>
        <section className="ledger-aside min-w-0 border-t border-border/70 pt-5 lg:border-t-0 lg:pt-0">
          {statsLoading ? (
            <CategoryAllocationSkeleton />
          ) : (
            <CategoryAllocation data={breakdown} total={spent} />
          )}
        </section>
      </div>
    </div>
  )
}
