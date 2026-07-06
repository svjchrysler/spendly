import { forwardRef } from 'react'
import { getCurrencySymbol } from '@/lib/currency-config'
import { cn } from '@/lib/utils'

interface ExpenseAmountInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  compact?: boolean
  hasError?: boolean
}

export const ExpenseAmountInput = forwardRef<
  HTMLInputElement,
  ExpenseAmountInputProps
>(function ExpenseAmountInput(
  { compact = false, hasError = false, className, ...props },
  ref,
) {
  const symbol = getCurrencySymbol()

  return (
    <label
      htmlFor={props.id ?? 'amount'}
      className={cn(
        'group relative block cursor-text rounded-2xl border transition-all duration-200',
        hasError
          ? 'border-destructive/40 bg-destructive/5'
          : 'border-border/40 bg-muted/10 hover:border-border/60 focus-within:border-primary/35 focus-within:bg-muted/20 focus-within:shadow-[0_0_0_1px_rgba(92,219,149,0.12)]',
        compact ? 'px-5 py-7' : 'px-4 py-5',
      )}
    >
      <div className="flex items-baseline justify-center gap-2">
        <span
          className={cn(
            'shrink-0 font-medium text-muted-foreground transition-colors group-focus-within:text-foreground/70',
            compact ? 'text-2xl' : 'text-xl',
          )}
        >
          {symbol}
        </span>
        <input
          ref={ref}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0,00"
          className={cn(
            'input-amount min-w-0 border-0 bg-transparent font-semibold text-foreground tabular-nums outline-none placeholder:text-muted-foreground/30',
            compact
              ? 'w-[min(12ch,48vw)] text-5xl leading-none tracking-tight'
              : 'w-[min(10ch,40vw)] text-4xl leading-none tracking-tight',
            className,
          )}
          {...props}
        />
      </div>
    </label>
  )
})
