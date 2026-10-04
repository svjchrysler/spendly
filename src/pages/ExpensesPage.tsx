import { useMemo } from 'react'
import { SearchX } from 'lucide-react'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { AnimatedAmount } from '@/components/ui/animated-amount'
import { Button } from '@/components/ui/button'
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
import { useSessionState } from '@/hooks/useSessionState'
import { foldForSearch } from '@/lib/format'

export function ExpensesPage() {
  const { year, month } = useMonth()
  // Persisten al ir y volver de otro tab: filtrar, mirar Resumen y volver
  // no debería obligar a filtrar de nuevo
  const [search, setSearch] = useSessionState('spendly-expenses-search', '')
  const [storedCategoryId, setCategoryId] = useSessionState<string | undefined>(
    'spendly-expenses-category',
    undefined,
  )
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: allExpenses = [], isLoading } = useExpenses(year, month)
  // Un filtro guardado de una categoría que ya no existe no debe dejar la
  // lista vacía sin explicación
  const categoryId =
    categoriesLoading || categories.some((category) => category.id === storedCategoryId)
      ? storedCategoryId
      : undefined

  const expenses = useMemo(() => {
    const q = foldForSearch(search.trim())
    return allExpenses.filter((expense) => {
      if (categoryId && expense.category_id !== categoryId) return false
      if (!q) return true
      return (
        foldForSearch(expense.description ?? '').includes(q) ||
        foldForSearch(expense.category?.name ?? '').includes(q)
      )
    })
  }, [allExpenses, categoryId, search])

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses],
  )

  const selectedCategory = categories.find((category) => category.id === categoryId)
  const filtered = Boolean(search.trim() || categoryId)

  function clearFilters() {
    setSearch('')
    setCategoryId(undefined)
  }

  if (isLoading && categoriesLoading) {
    return <ExpensesPageSkeleton />
  }

  const countLabel = `${expenses.length} ${expenses.length === 1 ? 'gasto' : 'gastos'}`
  // Una línea: el total del mes grande ya está en Resumen, y el detalle
  // (ticket medio, mayor, días) es de Análisis
  const summary = isLoading ? (
    <div className="flex items-center justify-between px-1" aria-hidden>
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-5 w-24" />
    </div>
  ) : (
    <div className="flex items-baseline justify-between gap-3 px-1">
      <p className="min-w-0 truncate text-subhead text-label-secondary">
        {filtered
          ? `${countLabel} de ${allExpenses.length}${selectedCategory ? ` · ${selectedCategory.name}` : ''}`
          : countLabel}
      </p>
      <p className="vt-month-total shrink-0 font-ledger text-headline text-label">
        {/* Corto: acá el total se recalcula tecla a tecla al filtrar y el
            conteo tiene que alcanzar a asentarse entre pulsaciones */}
        <AnimatedAmount value={total} duration={450} />
      </p>
    </div>
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
        {expenses.length === 0 && filtered ? (
          <div className="reveal flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary">
              <SearchX className="size-7" aria-hidden />
            </span>
            <p className="text-headline text-label">Sin resultados</p>
            <p className="max-w-[16rem] text-subhead text-label-secondary">
              Ningún gasto de este mes coincide con la búsqueda.
            </p>
            <Button
              type="button"
              variant="tinted"
              size="touch"
              className="mt-2 cursor-pointer rounded-full"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : null}
        <ExpenseList
          expenses={expenses}
          emptyCta={filtered ? undefined : 'Agregar tu primer gasto'}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-3">
      <MonthMasthead title="Gastos" />

      <div className="grid gap-5 @4xl/main:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] @4xl/main:items-start @4xl/main:gap-8 @6xl/main:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        {/* Riel sticky en dos columnas: búsqueda y filtros a mano mientras
            scrolleás la lista */}
        <aside className="order-1 min-w-0 space-y-4 @4xl/main:order-2 @4xl/main:sticky @4xl/main:top-[var(--sticky-top)]">
          {filters}
          {summary}
        </aside>

        <div className="order-2 min-w-0 @4xl/main:order-1">{list}</div>
      </div>
    </div>
  )
}
