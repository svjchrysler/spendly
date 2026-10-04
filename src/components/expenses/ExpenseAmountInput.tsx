import { useEffect, useRef, useState } from 'react'
import { formatAmountDraft, parseAmountDraft, toAmountDraft } from '@/lib/amount-draft'
import { getCurrencySymbol } from '@/lib/currency-config'
import { cn } from '@/lib/utils'

interface ExpenseAmountInputProps {
  id?: string
  /** Rótulo visible sobre la cifra */
  label?: string
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
  label = 'Monto',
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

  // Monto como protagonista del sheet, sin caja: la cifra grande en SF Pro
  // Rounded es el campo, igual que en Wallet al mandar dinero
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-0.5 pt-1 pb-2">
      <label htmlFor={id} className="cursor-text text-footnote text-label-secondary">
        {label}
      </label>
      <div className="flex min-w-0 items-baseline justify-center gap-2">
        <span className="shrink-0 font-ledger text-title-2 text-label-secondary">{symbol}</span>
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
            'input-amount font-ledger max-w-[10ch] min-w-[4ch] rounded-xl border-0 bg-transparent text-center text-[3.25rem] leading-tight font-bold caret-primary outline-none placeholder:text-label-quaternary focus-visible:bg-fill-quaternary',
            hasError ? 'text-destructive' : 'text-label',
            className,
          )}
          // El campo mide lo que mide la cifra: así el símbolo queda pegado al
          // número y el conjunto centrado, como en Wallet. Cifras tabulares →
          // cada dígito ocupa 1ch.
          style={{ width: `${Math.max(draft.length, 4) + 0.5}ch` }}
          {...props}
        />
      </div>
    </div>
  )
}
