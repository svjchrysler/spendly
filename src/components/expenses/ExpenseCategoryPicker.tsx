import { useEffect, useRef } from 'react'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface ExpenseCategoryPickerProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
}

/** Ancho del fade lateral de `.filter-scroll`: dejamos el chip justo después */
const EDGE_OFFSET = 12

export function ExpenseCategoryPicker({
  categories,
  value,
  onChange,
}: Readonly<ExpenseCategoryPickerProps>) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const alignedOnceRef = useRef(false)

  // Lleva la categoría activa (detectada o elegida) al inicio del riel
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !value) return
    // Desktop: los chips envuelven, no hay riel que alinear
    if (scroller.scrollWidth <= scroller.clientWidth) return

    const chip = scroller.querySelector<HTMLElement>(
      `[data-category-id="${CSS.escape(value)}"]`,
    )
    if (!chip) return

    const delta =
      chip.getBoundingClientRect().left - scroller.getBoundingClientRect().left
    const left = Math.max(
      0,
      Math.min(
        scroller.scrollLeft + delta - EDGE_OFFSET,
        scroller.scrollWidth - scroller.clientWidth,
      ),
    )
    if (Math.abs(left - scroller.scrollLeft) < 1) return

    const instant =
      !alignedOnceRef.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    alignedOnceRef.current = true
    // scrollTo y no scrollIntoView: este último arrastra al sheet en vertical
    scroller.scrollTo({ left, behavior: instant ? 'auto' : 'smooth' })
  }, [value, categories])

  return (
    <div
      ref={scrollerRef}
      aria-label="Categoría"
      className="filter-scroll -mx-1 flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1"
    >
      {categories.map((category) => {
        const isSelected = value === category.id
        return (
          <button
            key={category.id}
            type="button"
            data-category-id={category.id}
            aria-pressed={isSelected}
            onClick={() => onChange(category.id)}
            className={cn(
              'pressable inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium',
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
