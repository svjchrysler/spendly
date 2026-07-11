import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
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
    <section className="space-y-4">
      <div className="flex items-end gap-3 border-b border-border/70 pb-2.5 transition-colors focus-within:border-primary/45">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por descripción..."
            disabled={loading}
            aria-label="Buscar gastos"
            className="h-9 w-full bg-transparent pl-7 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
          />
        </div>
        {hasFilters ? (
          <button
            type="button"
            className="pressable mb-0.5 inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              onSearchChange('')
              onCategoryChange(undefined)
            }}
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        ) : null}
      </div>

      <div
        className="filter-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)',
        }}
      >
        <button
          type="button"
          disabled={loading}
          onClick={() => onCategoryChange(undefined)}
          className={cn(
            'pressable inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full border px-3.5 text-xs font-medium',
            !categoryId
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border/70 text-foreground/75 hover:border-border hover:text-foreground',
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
                'pressable inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium',
                selected
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/70 text-foreground/75 hover:border-border hover:text-foreground',
              )}
            >
              <CategoryIcon
                icon={category.icon}
                color={selected ? category.color : category.color}
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
