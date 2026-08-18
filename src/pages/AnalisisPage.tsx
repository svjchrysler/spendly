import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import {
  AnalisisPageSkeleton,
  CategoryAllocationSkeleton,
  ChartSkeleton,
} from '@/components/layout/skeletons'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { List, ListRow, ListSection } from '@/components/ui/list'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyBudget, useMonthlyHistory, useMonthlyStats } from '@/hooks/useMonthlyStats'
import { capitalize, formatCurrency, formatDayLabel } from '@/lib/format'
import { getExpenseLabel } from '@/lib/expense-display'
import { topShare } from '@/lib/month-insights'
import { buildMonthReport, type MonthReport } from '@/lib/month-report'
import { cn } from '@/lib/utils'

// Todos los charts son lazy: recharts (~111 kB gz) queda fuera del critical path
// y las métricas numéricas de la página pintan sin esperarlo.
const CategoryDonut = lazy(() =>
  import('@/components/charts/CategoryDonut').then((module) => ({
    default: module.CategoryDonut,
  })),
)

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
    <section className="stagger grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border/70 pb-5 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-border/60 sm:[&>*]:px-5 sm:[&>*:first-child]:pl-0 sm:[&>*:last-child]:pr-0">
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
    <section className="stagger grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border/70 pb-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-0 lg:divide-x lg:divide-border/60 lg:[&>*]:px-4 lg:[&>*:first-child]:pl-0 lg:[&>*:last-child]:pr-0">
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

type AnalysisPanel = 'historial' | 'ritmo'

const panelOptions: { id: AnalysisPanel; label: string }[] = [
  { id: 'historial', label: 'Historial' },
  { id: 'ritmo', label: 'Ritmo del mes' },
]

function PanelSwitch({
  value,
  onChange,
}: Readonly<{ value: AnalysisPanel; onChange: (panel: AnalysisPanel) => void }>) {
  return (
    <SegmentedControl
      asTabs
      ariaLabel="Vista de análisis"
      value={value}
      onValueChange={onChange}
      items={panelOptions.map((option) => ({ value: option.id, label: option.label }))}
    />
  )
}

function TopExpensesList({ report }: Readonly<{ report: MonthReport }>) {
  if (report.top.length === 0) {
    return (
      <ListSection header="Mayores gastos">
        <p className="list-row text-callout text-label-secondary">
          Sin movimientos este mes
        </p>
      </ListSection>
    )
  }

  return (
    <ListSection header="Mayores gastos" stagger>
      {report.top.map((expense, index) => (
        <ListRow
          key={`${expense.expense_date}-${expense.amount}-${index}`}
          title={getExpenseLabel(expense.description, expense.category?.name)}
          subtitle={`${formatDayLabel(expense.expense_date)}${expense.category?.name ? ` · ${expense.category.name}` : ''}`}
          trailing={
            <span className="font-ledger text-callout font-semibold tabular-nums">
              {formatCurrency(Number(expense.amount))}
            </span>
          }
        />
      ))}
    </ListSection>
  )
}

function MonthDetail({
  history,
}: Readonly<{ history: { label: string; total: number }[] }>) {
  const rows = [...history].reverse()

  return (
    <ListSection header="Detalle por mes" stagger>
      {rows.map((item, index) => {
        const previous = rows[index + 1]
        let delta: ReactNode = null
        if (previous && previous.total > 0) {
          const pct = ((item.total - previous.total) / previous.total) * 100
          const rising = pct > 0
          delta = (
            <span
              className={cn(
                'w-12 text-right font-ledger text-caption-1 tabular-nums',
                rising ? 'text-destructive' : 'text-primary',
              )}
            >
              {rising ? '+' : ''}
              {Math.round(pct)}%
            </span>
          )
        }
        return (
          <ListRow
            key={item.label}
            title={capitalize(item.label)}
            trailing={
              <span className="flex items-baseline gap-2.5">
                <span className="font-ledger text-callout font-semibold tabular-nums">
                  {formatCurrency(item.total)}
                </span>
                {delta ?? <span className="w-12" aria-hidden />}
              </span>
            }
          />
        )
      })}
    </ListSection>
  )
}

export function AnalisisPage() {
  const [panel, setPanel] = useState<AnalysisPanel>('historial')
  // El panel entra desde el lado del segmento que tocaste: el control y el
  // contenido quedan atados, en vez de ser un botón y una zona que parpadea
  const [panelDir, setPanelDir] = useState<'next' | 'prev'>('next')
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()
  const { data: expenses, isLoading: expensesLoading } = useExpenses(year, month)
  const { data: budget } = useMonthlyBudget(year, month)

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []
  const topThree = topShare(breakdown, spent, 3)

  // Agrega todo el mes (orden, medianas, series diarias): sin memo se recalcula
  // en cada toggle del PanelSwitch, que es puro cambio de estado local.
  const budgetAmount = budget?.amount ?? null
  const report = useMemo(
    () => buildMonthReport(expenses ?? [], year, month, budgetAmount),
    [expenses, year, month, budgetAmount],
  )

  const weekdayRows = useMemo(
    () =>
      report.byWeekday.map((item) => ({
        label: item.label,
        total: item.total,
        count: item.count,
      })),
    [report],
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

  return (
    <div className="flex flex-col gap-3 pb-3 lg:gap-4 lg:pb-6">
      <MonthMasthead eyebrow="Análisis" />

      {!expensesLoading ? <MonthPulse report={report} /> : null}

      <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8 xl:gap-10">
        <div className="flex min-w-0 flex-col gap-5">
          <PanelSwitch
            value={panel}
            onChange={(next) => {
              const from = panelOptions.findIndex((option) => option.id === panel)
              const to = panelOptions.findIndex((option) => option.id === next)
              setPanelDir(to > from ? 'next' : 'prev')
              setPanel(next)
            }}
          />

          {panel === 'historial' ? (
            <div
              key="historial"
              data-dir={panelDir}
              role="tabpanel"
              id="panel-historial"
              aria-labelledby="tab-historial"
              className="swap flex min-w-0 flex-col gap-5"
            >
              {history && history.length > 1 ? <TrendStrip history={history} /> : null}
              <section className="min-w-0">{historyPanel}</section>
              {history && history.length > 0 ? (
                <List>
                  <MonthDetail history={history} />
                </List>
              ) : null}
            </div>
          ) : (
            <div
              key="ritmo"
              data-dir={panelDir}
              role="tabpanel"
              id="panel-ritmo"
              aria-labelledby="tab-ritmo"
              className="swap flex min-w-0 flex-col gap-5"
            >
              {report.spent > 0 ? (
                <Suspense fallback={<ChartSkeleton />}>
                  <DailyPaceChart data={report.dailyPace} budget={report.budget} />
                  <WeekOfMonthChart data={report.byWeek} />
                  <WeekdayBarChart data={weekdayRows} />
                </Suspense>
              ) : (
                <p className="py-8 text-sm text-muted-foreground">
                  Sin movimientos este mes para medir el ritmo.
                </p>
              )}
            </div>
          )}
        </div>

        <section className="ledger-aside min-w-0 space-y-5 border-t border-border/70 pt-4 lg:sticky lg:top-[var(--sticky-top)] lg:border-t-0 lg:pt-0">
          {statsLoading ? (
            <CategoryAllocationSkeleton />
          ) : (
            <>
              <Suspense fallback={<ChartSkeleton />}>
                <CategoryDonut data={breakdown} total={spent} />
              </Suspense>
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
              <List>
                <TopExpensesList report={report} />
              </List>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
