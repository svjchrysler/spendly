import { forwardRef } from 'react'
import { MessageSquareText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpenseNoteInputProps extends React.ComponentProps<'input'> {
  compact?: boolean
  hasError?: boolean
}

export const ExpenseNoteInput = forwardRef<HTMLInputElement, ExpenseNoteInputProps>(
  function ExpenseNoteInput(
    { compact = false, hasError = false, className, ...props },
    ref,
  ) {
    return (
      <div className="relative">
        <MessageSquareText
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/50"
        />
        <input
          ref={ref}
          type="text"
          placeholder={compact ? '¿En qué gastaste?' : 'Ej: Cena, Uber, supermercado...'}
          className={cn(
            'w-full min-w-0 rounded-xl border bg-muted/10 text-foreground transition-colors outline-none placeholder:text-muted-foreground/45 focus-visible:bg-muted/20 focus-visible:ring-1',
            hasError
              ? 'border-destructive/50 focus-visible:border-destructive/50 focus-visible:ring-destructive/15'
              : 'border-border/50 focus-visible:border-primary/30 focus-visible:ring-primary/15',
            compact ? 'h-11 pl-10 text-base' : 'h-10 pl-10 text-sm',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
