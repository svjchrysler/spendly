import { useRef, type CSSProperties } from 'react'
import { tapFeedback } from '@/lib/haptics'
import { cn } from '@/lib/utils'

/**
 * Segmented control de iOS: cápsula con thumb que desliza.
 *
 * Semántica `radiogroup`/`radio`, que es lo que expone UISegmentedControl —
 * no `tablist`, salvo que efectivamente conmute paneles.
 *
 * El thumb reusa la técnica de `.tab-pill`: ancho = 1/n y `translateX` por
 * índice, así una sola transición cubre cualquier cantidad de segmentos.
 */

export type SegmentedItem<T extends string> = Readonly<{
  value: T
  label: string
}>

type SegmentedControlProps<T extends string> = Readonly<{
  value: T
  onValueChange: (value: T) => void
  items: readonly SegmentedItem<T>[]
  /** Cuando conmuta paneles, para exponer tablist en vez de radiogroup */
  asTabs?: boolean
  ariaLabel?: string
  className?: string
}>

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  items,
  asTabs = false,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = Math.max(
    items.findIndex((item) => item.value === value),
    0,
  )

  function onKeyDown(event: React.KeyboardEvent) {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = (activeIndex + delta + items.length) % items.length
    onValueChange(items[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role={asTabs ? 'tablist' : 'radiogroup'}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        'relative isolate flex w-full items-stretch rounded-full bg-fill-quaternary p-0.5',
        className,
      )}
      style={{ '--seg-count': items.length } as CSSProperties}
    >
      <span
        aria-hidden
        className="seg-thumb"
        style={{ '--seg-index': activeIndex } as CSSProperties}
      />
      {items.map((item, index) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role={asTabs ? 'tab' : 'radio'}
            // Los paneles ya venían con `aria-labelledby="tab-<valor>"`, pero
            // el id nunca se emitía: la relación tab↔panel estaba rota
            id={asTabs ? `tab-${item.value}` : undefined}
            aria-controls={asTabs ? `panel-${item.value}` : undefined}
            aria-selected={asTabs ? selected : undefined}
            aria-checked={asTabs ? undefined : selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!selected) tapFeedback()
              onValueChange(item.value)
            }}
            className={cn(
              'relative z-10 min-w-0 flex-1 cursor-pointer rounded-full px-3 py-1.5 text-subhead font-medium transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              selected ? 'text-label' : 'text-label-secondary',
            )}
          >
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
