import { useEffect, useRef, useState } from 'react'
import { formatAmountDraft, parseAmountDraft, toAmountDraft } from '@/lib/amount-draft'
import { getCurrencySymbol } from '@/lib/currency-config'
import { cn } from '@/lib/utils'

interface ExpenseAmountInputProps {
  id?: string
  value?: number
  onChange: (value: number | undefined) => void
  onBlur?: () => void
  hasError?: boolean
  autoFocus?: boolean
  'aria-invalid'?: boolean
  required?: boolean
  className?: string
}

export function ExpenseAmountInput({
  id = 'amount',
  value,
  onChange,
  onBlur,
  hasError = false,
  autoFocus,
  className,
  ...props
}: Readonly<ExpenseAmountInputProps>) {
  const symbol = getCurrencySymbol()
  const focusedRef = useRef(false)
  const [draft, setDraft] = useState(() => toAmountDraft(value))

  useEffect(() => {
    if (!focusedRef.current) setDraft(toAmountDraft(value))
  }, [value])

  return (
    <div
      className={cn(
        'w-full min-w-0 rounded-2xl border px-4 py-3.5 transition-all duration-200',
        hasError
          ? 'border-destructive/40 bg-destructive/5'
          : 'border-border/50 bg-muted/15 hover:border-border/70 focus-within:border-primary/40 focus-within:bg-muted/25 focus-within:ring-2 focus-within:ring-primary/20',
      )}
    >
      <label htmlFor={id} className="stat-label mb-2 block cursor-text text-center">
        Monto
      </label>
      <div className="flex min-w-0 items-baseline justify-center gap-2">
        <span className="shrink-0 text-lg font-medium text-muted-foreground">
          {symbol}
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          autoFocus={autoFocus}
          value={draft}
          onFocus={() => {
            focusedRef.current = true
          }}
          onChange={(e) => {
            const next = formatAmountDraft(e.target.value)
            setDraft(next)
            onChange(parseAmountDraft(next))
          }}
          onBlur={() => {
            focusedRef.current = false
            if (value != null && !Number.isNaN(value)) setDraft(toAmountDraft(value))
            onBlur?.()
          }}
          className={cn(
            'input-amount font-ledger w-full max-w-[12ch] min-w-0 border-0 bg-transparent text-center text-4xl font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums outline-none placeholder:text-muted-foreground/35 sm:text-5xl',
            className,
          )}
          {...props}
        />
      </div>
    </div>
  )
}
