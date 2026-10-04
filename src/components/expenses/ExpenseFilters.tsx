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

const chip =
  'pressable inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-subhead font-medium transition-colors'
const chipOn = 'bg-primary text-primary-foreground'
const chipOff = 'bg-group-surface text-label hover:bg-fill-quaternary'

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
    <section className="space-y-3">
      {/* Campo de búsqueda de iOS 26: cápsula, lupa adentro, "Cancelar" afuera */}
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-label-secondary"
            aria-hidden
          />
          <input
            type="search"
            name="buscar"
            autoComplete="off"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar"
            disabled={loading}
            aria-label="Buscar gastos"
            enterKeyHint="search"
            // 17px: bajo 16px iOS hace zoom al enfocar y descuadra la PWA
            className="h-11 w-full appearance-none rounded-full bg-fill-quaternary pr-10 pl-10 text-body text-label outline-none transition-colors placeholder:text-label-secondary focus-visible:bg-fill-tertiary focus-visible:ring-2 focus-visible:ring-primary/35 disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-label-tertiary text-background"
              aria-label="Borrar búsqueda"
            >
              <X className="size-3.5" strokeWidth={3} />
            </button>
          ) : null}
        </div>
        {hasFilters ? (
          <button
            type="button"
            className="pressable notice-in shrink-0 cursor-pointer text-body text-primary"
            onClick={() => {
              onSearchChange('')
              onCategoryChange(undefined)
            }}
          >
            Cancelar
          </button>
        ) : null}
      </div>

      <div className="filter-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Filtrar por categoría">
        <button
          type="button"
          disabled={loading}
          aria-pressed={!categoryId}
          onClick={() => onCategoryChange(undefined)}
          className={cn(chip, !categoryId ? chipOn : chipOff)}
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
              aria-pressed={selected}
              onClick={() => onCategoryChange(selected ? undefined : category.id)}
              className={cn(chip, selected ? chipOn : chipOff)}
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
    </section>
  )
}
