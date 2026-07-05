import { useState } from 'react'
import { Search, Receipt } from 'lucide-react'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonth } from '@/contexts/MonthContext'
import { useCategories } from '@/hooks/useCategories'
import { useFilteredExpenses } from '@/hooks/useExpenses'
export function ExpensesPage() {
  const { year, month } = useMonth()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>()
  const { data: categories = [] } = useCategories()
  const { data: expenses = [], isLoading } = useFilteredExpenses(
    year,
    month,
    categoryId,
    search,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Gastos</h1>
          <p className="text-sm text-muted-foreground">Historial y filtros del mes</p>
        </div>
        <MonthPicker />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descripción o categoría..."
            className="pl-9"
            aria-label="Buscar gastos"
          />
        </div>
        <Select
          value={categoryId ?? 'all'}
          onValueChange={(value) => {
            if (!value || value === 'all') setCategoryId(undefined)
            else setCategoryId(value)
          }}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-48">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Todas las categorías
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
          <Receipt className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No hay gastos</p>
          <p className="text-sm text-muted-foreground">
            Ajusta los filtros o agrega un nuevo gasto
          </p>
        </div>
      ) : (
        <ExpenseList expenses={expenses} showFab />
      )}
    </div>
  )
}
