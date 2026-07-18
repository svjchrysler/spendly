import { useEffect, useRef, useState } from 'react'
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

/** es-BO while typing: 1.234,56 — dots are thousands, comma is decimal */
function formatAmountDraft(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, '')

  let intDigits = ''
  let decDigits: string | null = null

  if (cleaned.includes(',')) {
    const [left, ...rest] = cleaned.split(',')
    intDigits = left.replace(/\D/g, '')
    decDigits = rest.join('').replace(/\D/g, '').slice(0, 2)
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.')
    const last = parts.at(-1) ?? ''
    if (parts.length === 2 && last.length <= 2) {
      intDigits = parts[0]?.replace(/\D/g, '') ?? ''
      decDigits = last.replace(/\D/g, '')
    } else {
      intDigits = parts.join('').replace(/\D/g, '')
    }
  } else {
    intDigits = cleaned.replace(/\D/g, '')
  }

  intDigits = intDigits.replace(/^0+(?=\d)/, '')
  if (!intDigits && decDigits != null) intDigits = '0'

  const withDots = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  if (decDigits != null) return `${withDots || '0'},${decDigits}`
  return withDots
}

function parseAmountDraft(draft: string): number | undefined {
  if (!draft || draft === ',') return undefined
  const normalized = draft.replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : undefined
}

function toDraft(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return ''
  return formatAmountDraft(value.toFixed(2).replace('.', ','))
}

if (import.meta.env.DEV) {
  const cases: [string, string, number?][] = [
    ['12000', '12.000', 12000],
    ['1.2000', '12.000', 12000],
    ['12.000', '12.000', 12000],
    ['1,20', '1,20', 1.2],
    ['1.5', '1,5', 1.5],
  ]
  for (const [input, expected, num] of cases) {
    const out = formatAmountDraft(input)
    if (out !== expected) console.error(`amount format: ${input} → ${out}, expected ${expected}`)
    if (num != null && parseAmountDraft(out) !== num) {
      console.error(`amount parse: ${out} → ${parseAmountDraft(out)}, expected ${num}`)
    }
  }
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
  const [draft, setDraft] = useState(() => toDraft(value))

  useEffect(() => {
    if (!focusedRef.current) setDraft(toDraft(value))
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
            if (value != null && !Number.isNaN(value)) setDraft(toDraft(value))
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
