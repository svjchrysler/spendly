import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SpendingHero } from '@/components/dashboard/SpendingHero'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { StatLabel } from '@/components/layout/Stat'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
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

export function DashboardPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: budget } = useMonthlyBudget(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(year, month)
  const recentExpenses = expenses.slice(0, 8)

  const spent = stats?.total ?? 0
  const topCategory = stats?.categoryBreakdown
    ?.slice()
    .sort((a, b) => b.total - a.total)[0] ?? null

  return (
    <div className="page-stack">
      {statsLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : (
        <SpendingHero
          spent={spent}
          transactionCount={expenses.length}
          budget={budget?.amount ?? null}
          topCategory={topCategory ? { name: topCategory.name, total: topCategory.total } : null}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {statsLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : (
          <CategoryAllocation data={stats?.categoryBreakdown ?? []} total={spent} />
        )}

        {historyLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : history && history.length > 0 ? (
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
            <MonthlyBar data={history} />
          </Suspense>
        ) : null}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <StatLabel>Actividad reciente</StatLabel>
          <Link
            to="/gastos"
            className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            Ver todos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {expensesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : recentExpenses.length === 0 ? (
          <>
            <div className="data-panel py-12 text-center">
              <p className="font-medium">Sin gastos este mes</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa el botón + para registrar tu primer gasto
              </p>
            </div>
            <ExpenseList expenses={[]} showFab />
          </>
        ) : (
          <ExpenseList expenses={recentExpenses} showFab />
        )}
      </section>
    </div>
  )
}
