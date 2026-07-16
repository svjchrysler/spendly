import {
  DashboardSkeleton,
  InsightsGridSkeleton,
  SpendingHeroSkeleton,
} from '@/components/layout/skeletons'
import { SpendingHero } from '@/components/dashboard/SpendingHero'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useMonthlyBudget, useMonthlyStats } from '@/hooks/useMonthlyStats'

interface CategorySlice {
  name: string
  total: number
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
    <div className="metric-cell space-y-1.5">
      <p className={cn('metric-cell-label', toneClass)}>{label}</p>
      <p className={cn('text-lg font-semibold tracking-tight tabular-nums sm:text-xl', toneClass)}>
        {value}
      </p>
      {hint ? <p className="text-xs tabular-nums text-muted-foreground sm:text-sm">{hint}</p> : null}
    </div>
  )
}

function InsightsGrid({
  topCategory,
  lowestCategory,
  budgetAmount,
  remaining,
  concentration,
}: Readonly<{
  topCategory: CategorySlice | null
  lowestCategory: CategorySlice | null
  budgetAmount: number | null
  remaining: number | null
  concentration: number
}>) {
  const overBudget = remaining != null && remaining < 0
  let budgetHint: string | undefined
  if (remaining != null) {
    budgetHint = overBudget ? 'Excedido' : `${formatCurrency(remaining)} libre`
  }

  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-4 sm:gap-x-8 lg:grid-cols-2 xl:grid-cols-4">
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
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(year, month)

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []
  const sorted = [...breakdown].sort((a, b) => b.total - a.total)
  const topCategory = sorted[0] ?? null
  const lowestCategory = sorted.length > 1 ? (sorted.at(-1) ?? null) : null
  const concentration = topCategory && spent > 0 ? (topCategory.total / spent) * 100 : 0
  const budgetAmount = budget?.amount ?? null
  const remaining = budgetAmount != null ? budgetAmount - spent : null

  if (statsLoading && expensesLoading) {
    return <DashboardSkeleton />
  }

  return (
    // ponytail: pack content top — stretch/justify-between left a void middle on tall desktops
    <div className="flex flex-col gap-1 pb-4 lg:pb-8">
      <div className="flex shrink-0 items-center justify-between gap-3 pb-2">
        <p className="stat-label">Este mes</p>
        <MonthPicker />
      </div>

      {!statsLoading ? <MonthlyCapAlert spent={spent} /> : null}

      <div className="grid gap-8 pt-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-x-12 xl:gap-x-16">
        <div className="flex min-w-0 flex-col gap-6 lg:gap-7">
          {statsLoading ? (
            <SpendingHeroSkeleton />
          ) : (
            <SpendingHero
              spent={spent}
              transactionCount={expenses.length}
              budget={budgetAmount}
            />
          )}

          {statsLoading ? (
            <InsightsGridSkeleton />
          ) : (
            <InsightsGrid
              topCategory={topCategory}
              lowestCategory={lowestCategory}
              budgetAmount={budgetAmount}
              remaining={remaining}
              concentration={concentration}
            />
          )}
        </div>

        <aside className="min-w-0 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12 xl:pl-14">
          {statsLoading ? null : <CategoryAllocation data={breakdown} total={spent} />}
        </aside>
      </div>

      <ExpenseList expenses={[]} showFab />
    </div>
  )
}
