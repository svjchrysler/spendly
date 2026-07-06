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
}: ExpenseFiltersProps) {
  const hasFilters = Boolean(search.trim() || categoryId)

  return (
    <section className="data-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="stat-label">Filtrar</p>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto cursor-pointer gap-1 px-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              onSearchChange('')
              onCategoryChange(undefined)
            }}
          >
            <X className="size-3" />
            Limpiar
          </Button>
        ) : null}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por descripción..."
          disabled={loading}
          className="h-10 border-border/60 bg-muted/20 pl-9 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
          aria-label="Buscar gastos"
        />
      </div>

      <div className="space-y-2.5">
        <p className="text-xs text-muted-foreground">Categoría</p>
        <div className="filter-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => onCategoryChange(undefined)}
            className={cn(
              'inline-flex shrink-0 cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
              !categoryId
                ? 'border-primary/40 bg-primary/10 text-foreground'
                : 'border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
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
                  'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                  selected
                    ? 'border-primary/40 bg-primary/10 text-foreground'
                    : 'border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                )}
              >
                <CategoryIcon
                  icon={category.icon}
                  color={category.color}
                  name={category.name}
                  size="pill"
                />
                <span className="whitespace-nowrap">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
