import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface ExpenseFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categoryId?: string
  onCategoryChange: (categoryId?: string) => void
  categories: Category[]
  loading?: boolean
}

export function ExpenseFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  loading = false,
}: Readonly<ExpenseFiltersProps>) {
  const hasFilters = Boolean(search.trim() || categoryId)

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            disabled={loading}
            className="h-9 border-0 border-b border-border/50 bg-transparent pl-9 shadow-none focus-visible:border-primary/40 focus-visible:ring-0"
            aria-label="Buscar gastos"
          />
        </div>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 cursor-pointer gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              onSearchChange('')
              onCategoryChange(undefined)
            }}
          >
            <X className="size-3.5" />
            Limpiar
          </Button>
        ) : null}
      </div>

      <div className="filter-scroll -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => onCategoryChange(undefined)}
          className={cn(
            'pressable inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full border px-2.5 text-xs font-medium',
            !categoryId
              ? 'border-primary/50 text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          Todas
        </button>
        {categories.map((category) => {
          const selected = categoryId === category.id
          return (
            <button
              key={category.id}
              type="button"
              disabled={loading}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'pressable inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs font-medium',
                selected
                  ? 'border-primary/50 text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <CategoryIcon
                icon={category.icon}
                color={selected ? category.color : undefined}
                name={category.name}
                size="pill"
              />
              <span className="whitespace-nowrap">{category.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
