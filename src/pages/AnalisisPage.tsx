import { lazy, Suspense, type ReactNode } from 'react'
import {
  AnalisisPageSkeleton,
  CategoryAllocationSkeleton,
  ChartSkeleton,
} from '@/components/layout/skeletons'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyBudget, useMonthlyHistory, useMonthlyStats } from '@/hooks/useMonthlyStats'
import { capitalize, formatCurrency, formatDayLabel } from '@/lib/format'
import { getExpenseLabel } from '@/lib/expense-display'
import { topShare } from '@/lib/month-insights'
import { buildMonthReport, type MonthReport } from '@/lib/month-report'
import { cn } from '@/lib/utils'

const MonthlyBar = lazy(() =>
  import('@/components/charts/MonthlyBar').then((module) => ({
    default: module.MonthlyBar,
  })),
)

const DailyPaceChart = lazy(() =>
  import('@/components/charts/DailyPaceChart').then((module) => ({
    default: module.DailyPaceChart,
  })),
)

const WeekdayBarChart = lazy(() =>
  import('@/components/charts/WeekdayBarChart').then((module) => ({
    default: module.WeekdayBarChart,
  })),
)

const WeekOfMonthChart = lazy(() =>
  import('@/components/charts/WeekOfMonthChart').then((module) => ({
    default: module.WeekOfMonthChart,
  })),
)

function TrendStrip({
  history,
}: Readonly<{ history: { label: string; total: number }[] }>) {
  const last = history.at(-1)
  const previous = history.at(-2)
  const average = history.reduce((sum, item) => sum + item.total, 0) / history.length
  const peak = history.reduce((max, item) => (item.total > max.total ? item : max), history[0])
  const trough = history.reduce(
    (min, item) => (item.total < min.total ? item : min),
    history[0],
  )

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
    <section className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border/70 pb-5 sm:grid-cols-4">
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
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Mes más bajo</p>
        <p className="metric-cell-value">
          {formatCurrency(trough.total)}
          <span className="ml-1.5 text-xs font-medium capitalize text-muted-foreground">
            {capitalize(trough.label)}
          </span>
        </p>
      </div>
    </section>
  )
}

function MonthPulse({ report }: Readonly<{ report: MonthReport }>) {
  const overBudget =
    report.remaining != null && report.remaining < 0

  return (
    <section className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border/70 pb-5 sm:grid-cols-3 lg:grid-cols-6">
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Movimientos</p>
        <p className="metric-cell-value">{report.count}</p>
        <p className="text-xs text-muted-foreground">
          {report.activeDays} días con gasto
        </p>
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Ticket medio</p>
        <p className="metric-cell-value">
          {report.ticket > 0 ? formatCurrency(report.ticket) : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          mediana {report.median > 0 ? formatCurrency(report.median) : '—'}
        </p>
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Mayor / menor</p>
        <p className="metric-cell-value">
          {report.largest > 0 ? formatCurrency(report.largest) : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          mín. {report.smallest > 0 ? formatCurrency(report.smallest) : '—'}
        </p>
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Fin de semana</p>
        <p className="metric-cell-value">
          {report.spent > 0 ? `${Math.round(report.weekendPct)}%` : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          pico {report.peakWeekday.total > 0 ? report.peakWeekday.label : '—'}
        </p>
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Proyección</p>
        <p
          className={cn(
            'metric-cell-value',
            report.budget != null &&
              report.projection > report.budget &&
              'text-destructive',
          )}
        >
          {report.isCurrentMonth && report.spent > 0
            ? formatCurrency(report.projection)
            : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          {report.isCurrentMonth
            ? `día ${report.dayOfMonth}/${report.daysInMonth}`
            : 'mes cerrado'}
        </p>
      </div>
      <div className="metric-cell space-y-1.5">
        <p className="metric-cell-label">Presupuesto</p>
        <p
          className={cn(
            'metric-cell-value',
            overBudget && 'text-destructive',
          )}
        >
          {report.budget != null ? formatCurrency(report.budget) : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          {report.budgetUsedPct != null
            ? `${Math.round(report.budgetUsedPct)}% usado`
            : 'sin cupo'}
        </p>
      </div>
    </section>
  )
}

function TopExpensesList({ report }: Readonly<{ report: MonthReport }>) {
  if (report.top.length === 0) {
    return (
      <section className="border-t border-border/70 pt-5">
        <p className="stat-label pb-2">Mayores gastos</p>
        <p className="py-4 text-sm text-muted-foreground">Sin movimientos este mes</p>
      </section>
    )
  }

  return (
    <section className="border-t border-border/70 pt-5">
      <p className="stat-label pb-2">Mayores gastos</p>
      <div className="divide-y divide-border/25">
        {report.top.map((expense, index) => (
          <div
            key={`${expense.expense_date}-${expense.amount}-${index}`}
            className="flex items-baseline justify-between gap-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium tracking-tight">
                {getExpenseLabel(expense.description, expense.category?.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDayLabel(expense.expense_date)}
                {expense.category?.name ? ` · ${expense.category.name}` : ''}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums tracking-tight">
              {formatCurrency(Number(expense.amount))}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function MonthDetail({
  history,
}: Readonly<{ history: { label: string; total: number }[] }>) {
  const rows = [...history].reverse()

  return (
    <section className="border-t border-border/70 pt-5">
      <p className="stat-label pb-2">Detalle por mes</p>
      <div className="divide-y divide-border/25">
        {rows.map((item, index) => {
          const previous = rows[index + 1]
          let delta: ReactNode = null
          if (previous && previous.total > 0) {
            const pct = ((item.total - previous.total) / previous.total) * 100
            const rising = pct > 0
            delta = (
              <span
                className={cn(
                  'w-12 text-right text-xs tabular-nums',
                  rising ? 'text-destructive' : 'text-primary',
                )}
              >
                {rising ? '+' : ''}
                {Math.round(pct)}%
              </span>
            )
          }
          return (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-3 py-2.5"
            >
              <span className="min-w-0 truncate text-sm font-medium tracking-tight">
                {capitalize(item.label)}
              </span>
              <span className="flex shrink-0 items-baseline gap-2.5">
                <span className="text-sm font-semibold tabular-nums tracking-tight">
                  {formatCurrency(item.total)}
                </span>
                {delta ?? <span className="w-12" aria-hidden />}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function AnalisisPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()
  const { data: expenses, isLoading: expensesLoading } = useExpenses(year, month)
  const { data: budget } = useMonthlyBudget(year, month)

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []
  const topThree = topShare(breakdown, spent, 3)

  const report = buildMonthReport(
    expenses ?? [],
    year,
    month,
    budget?.amount ?? null,
  )

  if (statsLoading && historyLoading && expensesLoading) {
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

  const weekdayRows = report.byWeekday.map((item) => ({
    label: item.label,
    total: item.total,
    count: item.count,
  }))

  return (
    <div className="flex flex-col gap-3 pb-3 lg:gap-4 lg:pb-6">
      <MonthMasthead eyebrow="Análisis" />

      {history && history.length > 1 ? <TrendStrip history={history} /> : null}

      {!expensesLoading ? <MonthPulse report={report} /> : null}

      <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8 xl:gap-10">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="min-w-0">{historyPanel}</section>
          {history && history.length > 0 ? <MonthDetail history={history} /> : null}
          {report.spent > 0 ? (
            <Suspense fallback={<ChartSkeleton />}>
              <DailyPaceChart data={report.dailyPace} budget={report.budget} />
              <WeekOfMonthChart data={report.byWeek} />
              <WeekdayBarChart data={weekdayRows} />
            </Suspense>
          ) : null}
        </div>

        <section className="ledger-aside min-w-0 space-y-5 border-t border-border/70 pt-4 lg:sticky lg:top-[calc(var(--app-header-h)_+_env(safe-area-inset-top))] lg:border-t-0 lg:pt-0">
          {statsLoading ? (
            <CategoryAllocationSkeleton />
          ) : (
            <>
              <CategoryDonut data={breakdown} total={spent} />
              <CategoryAllocation data={breakdown} total={spent} />
              {spent > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Las 3 categorías top concentran{' '}
                  <span className="font-semibold tabular-nums text-foreground">
                    {Math.round(topThree)}%
                  </span>{' '}
                  del mes · {formatCurrency(spent)} en total
                </p>
              ) : null}
              <TopExpensesList report={report} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
