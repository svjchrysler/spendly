import { useMemo, useState } from 'react'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { StatLabel } from '@/components/layout/Stat'
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonth } from '@/contexts/MonthContext'
import { useCategories } from '@/hooks/useCategories'
import { useFilteredExpenses } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/format'

export function ExpensesPage() {
  const { year, month } = useMonth()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: expenses = [], isLoading } = useFilteredExpenses(
    year,
    month,
    categoryId,
    search,
  )

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses],
  )

  const selectedCategory = categories.find((category) => category.id === categoryId)

  return (
    <div className="page-stack">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatLabel>Gastos del mes</StatLabel>
        <MonthPicker />
      </div>

      {!isLoading ? (
        <div className="data-panel flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="metric-chip-label">
              {selectedCategory ? selectedCategory.name : 'Todos los gastos'}
            </p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tabular-nums">{expenses.length}</p>
            <p className="text-xs text-muted-foreground">
              {expenses.length === 1 ? 'gasto' : 'gastos'}
            </p>
          </div>
        </div>
      ) : (
        <Skeleton className="h-24 w-full rounded-xl" />
      )}

      <ExpenseFilters
        search={search}
        onSearchChange={setSearch}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        loading={categoriesLoading}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {expenses.length === 0 ? (
            <div className="data-panel py-12 text-center">
              <p className="font-medium">No hay gastos</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajusta los filtros o usa el botón + para agregar uno
              </p>
            </div>
          ) : null}
          <ExpenseList expenses={expenses} showFab />
        </>
      )}
    </div>
  )
}
