import { useMemo, useState } from 'react'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters'
import { ExpenseList } from '@/components/expenses/ExpenseList'
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

  return (
    <div className="page-stack space-y-6">
      {!isLoading ? <MonthlyCapAlert spent={monthTotal} /> : null}

      {!isLoading ? (
        <section className="section-rule flex items-start justify-between gap-3 pb-6">
          <div className="min-w-0 space-y-2">
            <p className="stat-value">
              {formatCurrency(total)}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedCategory ? selectedCategory.name : 'Todos los gastos'}
              {' · '}
              {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
            </p>
          </div>
          <MonthPicker />
        </section>
      ) : (
        <Skeleton className="h-20 w-full" />
      )}

      <div className="space-y-4">
        <ExpenseFilters
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories}
          loading={categoriesLoading}
        />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {expenses.length === 0 ? (
              <div className="py-8">
                <p className="text-sm text-muted-foreground">No hay gastos</p>
              </div>
            ) : null}
            <ExpenseList expenses={expenses} showFab />
          </>
        )}
      </div>
    </div>
  )
}
