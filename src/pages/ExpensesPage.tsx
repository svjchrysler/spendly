import { useMemo, useState } from 'react'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import {
  ExpenseFiltersSkeleton,
  ExpenseListSkeleton,
  ExpensesPageSkeleton,
} from '@/components/layout/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonth } from '@/contexts/MonthContext'
import { useCategories } from '@/hooks/useCategories'
import { useExpenses } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/format'
import {
  activeExpenseDays,
  averageTicket,
  largestAmount,
} from '@/lib/month-insights'

export function ExpensesPage() {
  const { year, month } = useMonth()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: allExpenses = [], isLoading } = useExpenses(year, month)

  const expenses = useMemo(() => {
    const q = search.toLowerCase()
    return allExpenses.filter((expense) => {
      if (categoryId && expense.category_id !== categoryId) return false
      if (!q) return true
      return (
        expense.description?.toLowerCase().includes(q) ||
        expense.category?.name.toLowerCase().includes(q)
      )
    })
  }, [allExpenses, categoryId, search])

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses],
  )

  const monthTotal = useMemo(
    () => allExpenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [allExpenses],
  )

  const selectedCategory = categories.find((category) => category.id === categoryId)
  const filtered = Boolean(search.trim() || categoryId)
  const ticket = averageTicket(total, expenses.length)
  const maxExpense = largestAmount(expenses.map((item) => Number(item.amount)))
  const daysActive = activeExpenseDays(expenses.map((item) => item.expense_date))

  if (isLoading && categoriesLoading) {
    return <ExpensesPageSkeleton />
  }

  const summary = (
    <section className="min-w-0 space-y-3">
      <div className="space-y-2">
        <p className="stat-label">{filtered ? 'Total filtrado' : 'Total del mes'}</p>
        {isLoading ? (
          <Skeleton className="h-10 w-44" />
        ) : (
          <p className="stat-value text-[2.4rem] sm:text-[2.6rem] lg:text-[2.8rem]">
            {formatCurrency(total)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {selectedCategory ? selectedCategory.name : 'Todos los gastos'}
          {' · '}
          {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
        </p>
        {filtered && !isLoading ? (
          <p className="text-xs tabular-nums text-muted-foreground">
            Mes completo: {formatCurrency(monthTotal)}
          </p>
        ) : null}
      </div>

      {!isLoading && expenses.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 border-t border-border/70 pt-3">
          <div className="metric-cell space-y-1">
            <p className="metric-cell-label">Ticket medio</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(ticket)}</p>
          </div>
          <div className="metric-cell space-y-1">
            <p className="metric-cell-label">Mayor</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(maxExpense)}</p>
          </div>
          <div className="metric-cell space-y-1">
            <p className="metric-cell-label">Días activos</p>
            <p className="text-sm font-semibold tabular-nums">{daysActive}</p>
          </div>
        </div>
      ) : null}
    </section>
  )

  const filters = categoriesLoading ? (
    <ExpenseFiltersSkeleton />
  ) : (
    <ExpenseFilters
      search={search}
      onSearchChange={setSearch}
      categoryId={categoryId}
      onCategoryChange={setCategoryId}
      categories={categories}
    />
  )

  let list: React.ReactNode
  if (isLoading) {
    list = <ExpenseListSkeleton rows={6} />
  } else {
    list = (
      <>
        {expenses.length === 0 ? (
          <div className="py-8">
            <p className="text-sm text-muted-foreground">
              {filtered
                ? 'No hay gastos que coincidan. Limpia los filtros para ver todo el mes.'
                : 'Sin gastos este mes. Agrega el primero con el botón +.'}
            </p>
          </div>
        ) : null}
        <ExpenseList expenses={expenses} showFab />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-3 lg:gap-4 lg:pb-6">
      <MonthMasthead eyebrow="Gastos" />

      {!isLoading ? <MonthlyCapAlert spent={monthTotal} /> : null}

      <div className="grid gap-5 pt-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:gap-10">
        {/* Riel sticky: resumen + filtros siempre a mano mientras scrolleas la lista */}
        <aside className="ledger-aside order-1 min-w-0 space-y-4 lg:order-2 lg:sticky lg:top-[calc(var(--app-header-h)_+_env(safe-area-inset-top))]">
          {summary}
          <section className="min-w-0 border-t border-border/70 pt-4">{filters}</section>
        </aside>

        <div className="order-2 min-w-0 lg:order-1 lg:[--list-bleed:0px]">{list}</div>
      </div>
    </div>
  )
}
