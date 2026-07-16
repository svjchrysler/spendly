import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  DashboardSkeleton,
  ExpenseRowSkeleton,
  InsightsGridSkeleton,
  SpendingHeroSkeleton,
} from '@/components/layout/skeletons'
import { SpendingHero } from '@/components/dashboard/SpendingHero'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { ExpenseIcon } from '@/components/expenses/ExpenseIcon'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { getExpenseLabel } from '@/lib/expense-display'
import { formatCurrency, formatDayLabel } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useMonthlyBudget, useMonthlyStats } from '@/hooks/useMonthlyStats'
import type { ExpenseWithCategory } from '@/types/database'

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
    <section className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-2 xl:grid-cols-4">
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

function RecentMovements({
  expenses,
  loading,
}: Readonly<{ expenses: ExpenseWithCategory[]; loading: boolean }>) {
  const recent = expenses.slice(0, 6)

  let body: React.ReactNode
  if (loading) {
    body = (
      <div className="divide-y divide-border/25" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <ExpenseRowSkeleton key={i} />
        ))}
      </div>
    )
  } else if (recent.length === 0) {
    body = (
      <p className="py-6 text-sm text-muted-foreground">
        Sin movimientos este mes. Agrega tu primer gasto con el botón +.
      </p>
    )
  } else {
    body = (
      <div className="divide-y divide-border/25">
        {recent.map((expense) => (
          <div key={expense.id} className="row-hover flex min-w-0 items-center gap-3 py-2.5">
            <ExpenseIcon
              description={expense.description}
              categoryName={expense.category?.name}
              categoryIcon={expense.category?.icon}
              categoryColor={expense.category?.color}
              size="sm"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-medium leading-tight tracking-tight">
                {getExpenseLabel(expense.description, expense.category?.name)}
              </p>
              <p className="truncate text-xs capitalize leading-tight text-muted-foreground">
                {formatDayLabel(expense.expense_date)}
                {expense.category?.name ? ` · ${expense.category.name}` : ''}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums tracking-tight">
              {formatCurrency(Number(expense.amount))}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="min-w-0 border-t border-border/70 pt-5">
      <div className="flex items-baseline justify-between gap-3 pb-2">
        <p className="stat-label">Movimientos recientes</p>
        <Link
          to="/gastos"
          className="pressable inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          Ver todos
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {body}
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
    <div className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8">
      <MonthMasthead eyebrow="Resumen" />

      {!statsLoading ? <MonthlyCapAlert spent={spent} /> : null}

      <div className="grid gap-8 pt-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
          {statsLoading ? (
            <SpendingHeroSkeleton />
          ) : (
            <SpendingHero
              spent={spent}
              transactionCount={expenses.length}
              budget={budgetAmount}
            />
          )}

          <div className="border-t border-border/70 pt-5">
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

          <RecentMovements expenses={expenses} loading={expensesLoading} />
        </div>

        <aside className="ledger-aside min-w-0 border-t border-border/70 pt-5 lg:border-t-0 lg:pt-0">
          {statsLoading ? null : <CategoryAllocation data={breakdown} total={spent} />}
        </aside>
      </div>

      <ExpenseList expenses={[]} showFab />
    </div>
  )
}
