import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import {
  AnalisisPageSkeleton,
  CategoryAllocationSkeleton,
  ChartSkeleton,
} from '@/components/layout/skeletons'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { ContentSection, List, ListRow, ListSection } from '@/components/ui/list'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyBudget, useMonthlyHistory, useMonthlyStats } from '@/hooks/useMonthlyStats'
import { capitalize, formatCurrency, formatDayLabel } from '@/lib/format'
import { getExpenseLabel } from '@/lib/expense-display'
import { topShare } from '@/lib/month-insights'
import type { HistoryMonth } from '@/lib/month-history'
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

/*
  Un mes en curso contra un mes completo siempre "baja": el día 5 de
  septiembre no se puede comparar con agosto entero. Si el mes todavía corre,
  la base es lo gastado en el mes anterior hasta el mismo día.
*/
function comparisonBase(item: HistoryMonth, previous: HistoryMonth) {
  return item.inProgress ? previous.totalToDay : previous.total
}

/*
  Celdas de métricas en una sola tarjeta, separadas por hairlines: el gap de
  1px deja ver el separador de fondo, igual que las celdas de una lista.
*/
function MetricGrid({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <section
      className={cn(
        'stagger grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] bg-separator',
        className,
      )}
    >
      {children}
    </section>
  )
}

function MetricCell({
  label,
  value,
  note,
  tone,
}: Readonly<{
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: 'destructive' | 'positive'
}>) {
  return (
    <div className="metric-cell bg-group-surface px-4 py-3">
      <p className="metric-cell-label">{label}</p>
      <p
        className={cn(
          'metric-cell-value',
          tone === 'destructive' && 'text-destructive',
          tone === 'positive' && 'text-primary',
        )}
      >
        {value}
      </p>
      {note ? <p className="text-footnote text-label-secondary">{note}</p> : null}
    </div>
  )
}

function TrendStrip({ history }: Readonly<{ history: HistoryMonth[] }>) {
  const last = history.at(-1)
  const previous = history.at(-2)
  const average = history.reduce((sum, item) => sum + item.total, 0) / history.length
  const peak = history.reduce((max, item) => (item.total > max.total ? item : max), history[0])
  const trough = history.reduce(
    (min, item) => (item.total < min.total ? item : min),
    history[0],
  )

  let delta: ReactNode = '—'
  let deltaTone: 'destructive' | 'positive' | undefined
  const base = last && previous ? comparisonBase(last, previous) : 0
  if (last && previous && base > 0) {
    const pct = ((last.total - base) / base) * 100
    delta = `${pct > 0 ? '+' : ''}${Math.round(pct)}%`
    deltaTone = pct > 0 ? 'destructive' : 'positive'
  }

  return (
    <MetricGrid className="@xl/main:grid-cols-4">
      <MetricCell label="Promedio mensual" value={formatCurrency(average)} />
      <MetricCell
        label="Vs. mes anterior"
        value={delta}
        tone={deltaTone}
        note={last?.inProgress && last.cutoffDay ? `al día ${last.cutoffDay}` : undefined}
      />
      <MetricCell
        label="Mes más alto"
        value={formatCurrency(peak.total)}
        note={capitalize(peak.label)}
      />
      <MetricCell
        label="Mes más bajo"
        value={formatCurrency(trough.total)}
        note={capitalize(trough.label)}
      />
    </MetricGrid>
  )
}

function MonthPulse({ report }: Readonly<{ report: MonthReport }>) {
  const overBudget = report.remaining != null && report.remaining < 0

  return (
    <MetricGrid className="@xl/main:grid-cols-3">
      <MetricCell
        label="Movimientos"
        value={report.count}
        note={`${report.activeDays} días con gasto`}
      />
      <MetricCell
        label="Ticket medio"
        value={report.ticket > 0 ? formatCurrency(report.ticket) : '—'}
        note={`mediana ${report.median > 0 ? formatCurrency(report.median) : '—'}`}
      />
      <MetricCell
        label="Mayor gasto"
        value={report.largest > 0 ? formatCurrency(report.largest) : '—'}
        note={`menor ${report.smallest > 0 ? formatCurrency(report.smallest) : '—'}`}
      />
      <MetricCell
        label="Fin de semana"
        value={report.spent > 0 ? `${Math.round(report.weekendPct)}%` : '—'}
        note={`pico ${report.peakWeekday.total > 0 ? report.peakWeekday.label : '—'}`}
      />
      <MetricCell
        label="Proyección"
        value={report.isCurrentMonth && report.spent > 0 ? formatCurrency(report.projection) : '—'}
        tone={
          report.budget != null && report.projection > report.budget ? 'destructive' : undefined
        }
        note={report.isCurrentMonth ? `día ${report.dayOfMonth} de ${report.daysInMonth}` : 'mes cerrado'}
      />
      <MetricCell
        label="Presupuesto"
        value={report.budget != null ? formatCurrency(report.budget) : '—'}
        tone={overBudget ? 'destructive' : undefined}
        note={
          report.budgetUsedPct != null ? `${Math.round(report.budgetUsedPct)}% usado` : 'sin definir'
        }
      />
    </MetricGrid>
  )
}

type AnalysisPanel = 'historial' | 'ritmo'

// El mes que estás mirando primero: el subtítulo de la pantalla es ese mes
const panelOptions: { id: AnalysisPanel; label: string }[] = [
  { id: 'ritmo', label: 'Este mes' },
  { id: 'historial', label: 'Historial' },
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
      <ListSection>
        <p className="list-row text-callout text-label-secondary">
          Sin movimientos este mes
        </p>
      </ListSection>
    )
  }

  return (
    <ListSection stagger="on-enter">
      {report.top.map((expense, index) => (
        <ListRow
          key={`${expense.expense_date}-${expense.amount}-${index}`}
          title={getExpenseLabel(expense.description, expense.category?.name)}
          subtitle={`${formatDayLabel(expense.expense_date)}${expense.category?.name ? ` · ${expense.category.name}` : ''}`}
          trailing={
            <span className="font-ledger text-body font-semibold">
              {formatCurrency(Number(expense.amount))}
            </span>
          }
        />
      ))}
    </ListSection>
  )
}

function MonthDetail({ history }: Readonly<{ history: HistoryMonth[] }>) {
  const rows = [...history].reverse()

  return (
    <ListSection header="Detalle por mes" stagger="on-enter">
      {rows.map((item, index) => {
        const previous = rows[index + 1]
        let delta: ReactNode = null
        const base = previous ? comparisonBase(item, previous) : 0
        if (previous && base > 0) {
          const pct = ((item.total - base) / base) * 100
          const rising = pct > 0
          delta = (
            <span
              className={cn(
                'w-12 text-right font-ledger text-footnote',
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
            subtitle={
              item.inProgress && item.cutoffDay
                ? `En curso · vs. ${previous?.label ?? 'mes anterior'} al día ${item.cutoffDay}`
                : undefined
            }
            trailing={
              <span className="flex items-baseline gap-2.5">
                <span className="font-ledger text-body font-semibold">
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
  const [panel, setPanel] = useState<AnalysisPanel>('ritmo')
  // El panel entra desde el lado del segmento que tocaste: el control y el
  // contenido quedan atados, en vez de ser un botón y una zona que parpadea
  const [panelDir, setPanelDir] = useState<'next' | 'prev'>('next')
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory(year, month)
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
    <p className="surface-card text-callout text-label-secondary">Sin historial aún</p>
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
    <div className="flex flex-col gap-4 pb-3">
      <MonthMasthead title="Análisis" />

      <div className="grid gap-7 @4xl/main:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] @4xl/main:items-start @4xl/main:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
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
              className="swap flex min-w-0 flex-col gap-4"
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
              className="swap flex min-w-0 flex-col gap-4"
            >
              {!expensesLoading ? <MonthPulse report={report} /> : null}
              {report.spent > 0 ? (
                <Suspense fallback={<ChartSkeleton />}>
                  <DailyPaceChart data={report.dailyPace} budget={report.budget} />
                  <WeekOfMonthChart data={report.byWeek} />
                  <WeekdayBarChart data={weekdayRows} />
                </Suspense>
              ) : (
                <p className="surface-card text-callout text-label-secondary">
                  Sin movimientos este mes para medir el ritmo.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-7 @4xl/main:sticky @4xl/main:top-[var(--sticky-top)]">
          <ContentSection title="Por categoría">
            {statsLoading ? (
              <CategoryAllocationSkeleton />
            ) : (
              <div className="space-y-3">
                {spent > 0 ? (
                  <div className="surface-card">
                    <Suspense fallback={<div className="h-44" aria-hidden />}>
                      <CategoryDonut data={breakdown} total={spent} />
                    </Suspense>
                  </div>
                ) : null}
                <CategoryAllocation data={breakdown} total={spent} />
                {spent > 0 ? (
                  <p className="px-4 text-footnote text-label-secondary">
                    Las 3 categorías principales concentran el{' '}
                    <span className="font-semibold text-label">{Math.round(topThree)}%</span> del
                    mes.
                  </p>
                ) : null}
              </div>
            )}
          </ContentSection>

          <ContentSection title="Mayores gastos">
            <List>
              <TopExpensesList report={report} />
            </List>
          </ContentSection>
        </div>
      </div>
    </div>
  )
}
