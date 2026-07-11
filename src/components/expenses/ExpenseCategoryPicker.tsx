import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface ExpenseCategoryPickerProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
}

export function ExpenseCategoryPicker({
  categories,
  value,
  onChange,
}: Readonly<ExpenseCategoryPickerProps>) {
  return (
    <div
      aria-label="Categoría"
      className="filter-scroll -mx-1 flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1"
    >
      {categories.map((category) => {
        const isSelected = value === category.id
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(category.id)}
            className={cn(
              'pressable inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm font-medium',
              isSelected
                ? 'border-primary/45 bg-primary/12 text-foreground'
                : 'border-border/60 bg-muted/15 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
            )}
          >
            <CategoryIcon
              icon={category.icon}
              color={isSelected ? category.color : undefined}
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
