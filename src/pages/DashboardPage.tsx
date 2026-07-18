import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  CategoryAllocationSkeleton,
  DashboardSkeleton,
  ExpenseRowSkeleton,
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
import { useMonthlyBudget, useMonthlyStats } from '@/hooks/useMonthlyStats'
import type { ExpenseWithCategory } from '@/types/database'

function RecentMovements({
  expenses,
  loading,
}: Readonly<{ expenses: ExpenseWithCategory[]; loading: boolean }>) {
  const recent = expenses.slice(0, 5)

  let body: React.ReactNode
  if (loading) {
    body = (
      <div className="flex flex-1 flex-col justify-evenly divide-y divide-border/25" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <ExpenseRowSkeleton key={i} />
        ))}
      </div>
    )
  } else if (recent.length === 0) {
    body = (
      <p className="flex flex-1 items-center py-8 text-sm text-muted-foreground">
        Sin movimientos este mes. Agrega tu primer gasto con el botón +.
      </p>
    )
  } else {
    body = (
      <div className="flex flex-1 flex-col justify-evenly divide-y divide-border/25">
        {recent.map((expense) => (
          <div
            key={expense.id}
            className="row-hover flex min-w-0 items-center gap-3.5 py-3.5 sm:py-4"
          >
            <ExpenseIcon
              description={expense.description}
              categoryName={expense.category?.name}
              categoryIcon={expense.category?.icon}
              categoryColor={expense.category?.color}
              size="sm"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium leading-tight tracking-tight sm:text-[15px]">
                {getExpenseLabel(expense.description, expense.category?.name)}
              </p>
              <p className="truncate text-xs capitalize leading-tight text-muted-foreground">
                {formatDayLabel(expense.expense_date)}
                {expense.category?.name ? ` · ${expense.category.name}` : ''}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums tracking-tight sm:text-[15px]">
              {formatCurrency(Number(expense.amount))}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col border-t border-border/70 pt-5">
      <div className="flex shrink-0 items-baseline justify-between gap-3 pb-1">
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
  const budgetAmount = budget?.amount ?? null

  if (statsLoading && expensesLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-h)-env(safe-area-inset-top)-5.5rem)] flex-col gap-4 pb-2 md:min-h-[calc(100dvh-var(--app-header-h)-env(safe-area-inset-top)-3.5rem)] lg:gap-5">
      <MonthMasthead eyebrow="Resumen" />

      {!statsLoading ? <MonthlyCapAlert spent={spent} /> : null}

      <div className="grid min-h-0 flex-1 gap-6 pt-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-8 xl:gap-10">
        <div className="flex min-h-0 min-w-0 flex-col gap-6 lg:gap-8">
          {statsLoading ? (
            <SpendingHeroSkeleton />
          ) : (
            <SpendingHero
              spent={spent}
              transactionCount={expenses.length}
              budget={budgetAmount}
            />
          )}

          <RecentMovements expenses={expenses} loading={expensesLoading} />
        </div>

        <aside className="ledger-aside flex min-h-0 min-w-0 flex-col border-t border-border/70 pt-5 lg:border-t-0 lg:pt-0">
          {statsLoading ? (
            <CategoryAllocationSkeleton fill />
          ) : (
            <CategoryAllocation data={breakdown} total={spent} limit={6} fill />
          )}
        </aside>
      </div>

      <ExpenseList expenses={[]} showFab />
    </div>
  )
}
