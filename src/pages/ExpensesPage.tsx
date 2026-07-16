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

  if (isLoading && categoriesLoading) {
    return <ExpensesPageSkeleton />
  }

  const summary = (
    <section className="min-w-0 space-y-2">
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
    <div className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8">
      <MonthMasthead eyebrow="Gastos" />

      {!isLoading ? <MonthlyCapAlert spent={monthTotal} /> : null}

      <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        {/* Riel sticky: resumen + filtros siempre a mano mientras scrolleas la lista */}
        <aside className="ledger-aside order-1 min-w-0 space-y-5 lg:order-2 lg:sticky lg:top-[calc(4.25rem_+_env(safe-area-inset-top))]">
          {summary}
          <section className="min-w-0 border-t border-border/70 pt-4">{filters}</section>
        </aside>

        <div className="order-2 min-w-0 lg:order-1 lg:[--list-bleed:0px]">{list}</div>
      </div>
    </div>
  )
}
