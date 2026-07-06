import { useState } from 'react'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

const MOBILE_VISIBLE_COUNT = 8

interface ExpenseCategoryPickerProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  compact?: boolean
}

export function ExpenseCategoryPicker({
  categories,
  value,
  onChange,
  compact = false,
}: ExpenseCategoryPickerProps) {
  const selected = categories.find((category) => category.id === value)

  if (!compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = value === category.id
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all duration-200',
                isSelected
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-border/70 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
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
    )
  }

  return (
    <ExpenseCategoryPickerCompact
      categories={categories}
      value={value}
      onChange={onChange}
      selected={selected}
    />
  )
}

function ExpenseCategoryPickerCompact({
  categories,
  value,
  onChange,
  selected,
}: ExpenseCategoryPickerProps & { selected?: Category }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? categories : categories.slice(0, MOBILE_VISIBLE_COUNT)
  const hiddenCount = categories.length - MOBILE_VISIBLE_COUNT

  return (
    <div className="space-y-2.5">
      <p className="text-sm text-muted-foreground">
        {selected ? selected.name : 'Elige una categoría'}
      </p>
      <div className="filter-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        {visible.map((category) => {
          const isSelected = value === category.id
          return (
            <button
              key={category.id}
              type="button"
              aria-label={category.name}
              aria-pressed={isSelected}
              onClick={() => onChange(category.id)}
              className={cn(
                'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200',
                isSelected
                  ? 'border-primary/50 bg-primary/10 shadow-[0_0_0_1px_rgba(92,219,149,0.25)]'
                  : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/35',
              )}
            >
              <CategoryIcon
                icon={category.icon}
                color={isSelected ? category.color : undefined}
                name={category.name}
                size="pill"
              />
            </button>
          )
        })}
      </div>
      {!expanded && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todas ({categories.length})
        </button>
      ) : null}
    </div>
  )
}
