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
        placeholder="Ej: Cena, Uber, supermercado..."
        className={cn(
          'h-11 w-full min-w-0 rounded-xl border bg-muted/15 px-3.5 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground/50 focus-visible:bg-muted/25 focus-visible:ring-1',
          hasError
            ? 'border-destructive/50 focus-visible:border-destructive/50 focus-visible:ring-destructive/15'
            : 'border-border/60 focus-visible:border-primary/35 focus-visible:ring-primary/20',
          className,
        )}
        {...props}
      />
    )
  },
)
