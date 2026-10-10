import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ExpenseNoteInputProps extends React.ComponentProps<'input'> {
  hasError?: boolean
}

export const ExpenseNoteInput = forwardRef<HTMLInputElement, ExpenseNoteInputProps>(
  function ExpenseNoteInput({ hasError = false, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="text"
        placeholder="Cena, Uber, supermercado…"
        enterKeyHint="done"
        autoCapitalize="sentences"
        className={cn(
          // Celda agrupada de iOS: superficie de celda, sin borde. 17px: bajo
          // 16px iOS hace zoom al enfocar y descuadra la PWA
          'h-12 w-full min-w-0 rounded-xl bg-sheet-cell px-4 text-body text-label outline-none transition-shadow placeholder:text-label-tertiary',
          hasError ? 'ring-1 ring-destructive/60' : 'focus-visible:ring-2 focus-visible:ring-primary/35',
          className,
        )}
        {...props}
      />
    )
  },
)
