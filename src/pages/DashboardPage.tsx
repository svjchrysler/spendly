import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Receipt } from 'lucide-react'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { BudgetBullet } from '@/components/charts/BudgetBullet'
import { MonthlyBar } from '@/components/charts/MonthlyBar'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import {
  useMonthlyBudget,
  useMonthlyHistory,
  useMonthlyStats,
} from '@/hooks/useMonthlyStats'
import { formatCurrency } from '@/lib/format'

export function DashboardPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: budget } = useMonthlyBudget(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(year, month)
  const recentExpenses = expenses.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Resumen</h1>
          <p className="text-sm text-muted-foreground">Controla tus gastos del mes</p>
        </div>
        <MonthPicker />
      </div>

      {statsLoading ? (
        <Skeleton className="h-28 w-full rounded-2xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/20 to-card p-6"
        >
          <p className="text-sm text-muted-foreground">Total gastado</p>
          <p className="font-display text-5xl tracking-tight">
            {formatCurrency(stats?.total ?? 0)}
          </p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetBullet spent={stats?.total ?? 0} budget={budget?.amount ?? null} />
        {statsLoading ? (
          <Skeleton className="h-80 w-full rounded-xl" />
        ) : (
          <CategoryDonut data={stats?.categoryBreakdown ?? []} />
        )}
      </div>

      {historyLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <MonthlyBar data={history ?? []} />
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Gastos recientes</h2>
          <Link
            to="/gastos"
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {expensesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
            <Receipt className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium">Sin gastos este mes</p>
            <p className="text-sm text-muted-foreground">
              Usa el botón + para registrar tu primer gasto
            </p>
          </div>
        ) : (
          <ExpenseList expenses={recentExpenses} showFab />
        )}
      </section>
    </div>
  )
}
