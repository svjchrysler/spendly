import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SpendingHero } from '@/components/dashboard/SpendingHero'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  useMonthlyBudget,
  useMonthlyHistory,
  useMonthlyStats,
} from '@/hooks/useMonthlyStats'

const MonthlyBar = lazy(() =>
  import('@/components/charts/MonthlyBar').then((module) => ({
    default: module.MonthlyBar,
  })),
)

interface CategorySlice {
  name: string
  total: number
}

interface InsightsGridProps {
  topCategory: CategorySlice | null
  lowestCategory: CategorySlice | null
  budgetAmount: number | null
  remaining: number | null
  concentration: number
}

function InsightCell({
  label,
  value,
  hint,
  tone,
}: Readonly<{
  label: string
  value: string
  hint?: string
  tone?: 'primary' | 'destructive'
}>) {
  let toneClass: string | undefined
  if (tone === 'primary') toneClass = 'text-primary'
  else if (tone === 'destructive') toneClass = 'text-destructive'
  return (
    <div className="metric-cell">
      <p className={cn('metric-cell-label', toneClass)}>{label}</p>
      <p className={cn('metric-cell-value truncate', toneClass)}>{value}</p>
      {hint ? <p className="text-xs tabular-nums text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function InsightsGrid({
  topCategory,
  lowestCategory,
  budgetAmount,
  remaining,
  concentration,
}: Readonly<InsightsGridProps>) {
  const overBudget = remaining != null && remaining < 0
  let budgetHint: string | undefined
  if (remaining != null) {
    budgetHint = overBudget ? 'Excedido' : `${formatCurrency(remaining)} libre`
  }

  return (
    <section className="section-rule grid grid-cols-2 gap-x-8 gap-y-8 py-8 sm:grid-cols-4 sm:py-10">
      <InsightCell
        label="Mayor gasto"
        tone="primary"
        value={topCategory ? topCategory.name : '—'}
        hint={topCategory ? formatCurrency(topCategory.total) : undefined}
      />
      <InsightCell
        label="Menor gasto"
        tone={lowestCategory ? 'destructive' : undefined}
        value={lowestCategory ? lowestCategory.name : '—'}
        hint={lowestCategory ? formatCurrency(lowestCategory.total) : undefined}
      />
      <InsightCell
        label="Presupuesto"
        value={budgetAmount != null ? formatCurrency(budgetAmount) : '—'}
        hint={budgetHint}
      />
      <InsightCell
        label="Concentración"
        value={`${Math.round(concentration)}%`}
        hint="en la categoría top"
      />
    </section>
  )
}

export function DashboardPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: budget } = useMonthlyBudget(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(year, month)
  const recentExpenses = expenses.slice(0, 8)

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []
  const sorted = [...breakdown].sort((a, b) => b.total - a.total)
  const topCategory = sorted[0] ?? null
  const lowestCategory = sorted.length > 1 ? (sorted.at(-1) ?? null) : null
  const concentration = topCategory && spent > 0 ? (topCategory.total / spent) * 100 : 0
  const budgetAmount = budget?.amount ?? null
  const remaining = budgetAmount != null ? budgetAmount - spent : null

  let historyPanel = null
  if (historyLoading) {
    historyPanel = <Skeleton className="h-56 w-full" />
  } else if (history && history.length > 0) {
    historyPanel = (
      <Suspense fallback={<Skeleton className="h-56 w-full" />}>
        <MonthlyBar data={history} />
      </Suspense>
    )
  }

  let recentPanel = <ExpenseList expenses={recentExpenses} showFab />
  if (expensesLoading) {
    recentPanel = (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  } else if (recentExpenses.length === 0) {
    recentPanel = (
      <>
        <div className="py-8">
          <p className="text-sm text-muted-foreground">Sin gastos este mes</p>
        </div>
        <ExpenseList expenses={[]} showFab />
      </>
    )
  }

  return (
    <div className="page-stack">
      <div className="flex justify-end pb-6">
        <MonthPicker />
      </div>

      {statsLoading ? (
        <Skeleton className="mb-10 h-40 w-full" />
      ) : (
        <section className="section-rule grid gap-10 pb-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16 lg:pb-12">
          <SpendingHero
            spent={spent}
            transactionCount={expenses.length}
            budget={budgetAmount}
            topCategory={topCategory ? { name: topCategory.name, total: topCategory.total } : null}
          />
          <CategoryAllocation data={breakdown} total={spent} />
        </section>
      )}

      {!statsLoading ? (
        <InsightsGrid
          topCategory={topCategory}
          lowestCategory={lowestCategory}
          budgetAmount={budgetAmount}
          remaining={remaining}
          concentration={concentration}
        />
      ) : null}

      {historyPanel ? (
        <section className="section-rule py-8 sm:py-10">{historyPanel}</section>
      ) : null}

      <section className="space-y-5 pt-8 sm:pt-10">
        <div className="flex items-center justify-between">
          <p className="stat-label">Actividad reciente</p>
          <Link
            to="/gastos"
            className="pressable inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            Ver todos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {recentPanel}
      </section>
    </div>
  )
}
