import { AlertTriangle } from 'lucide-react'
import {
  getMonthlyCapLevel,
  getMonthlyCapMessage,
} from '@/lib/monthly-cap'
import { cn } from '@/lib/utils'

interface MonthlyCapAlertProps {
  spent: number
}

export function MonthlyCapAlert({ spent }: Readonly<MonthlyCapAlertProps>) {
  const level = getMonthlyCapLevel(spent)
  const message = getMonthlyCapMessage(spent)
  if (!message) return null

  return (
    <output
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-snug',
        level === 'over'
          ? 'border-destructive/30 bg-destructive/8 text-destructive'
          : 'border-amber-600/25 bg-amber-500/10 text-amber-800 dark:border-amber-500/30 dark:text-amber-200',
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0">{message}</p>
    </output>
  )
}
