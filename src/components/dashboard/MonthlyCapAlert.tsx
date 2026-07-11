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
        'flex items-start gap-2.5 border-b py-3 text-sm',
        level === 'over'
          ? 'border-destructive/40 text-destructive'
          : 'border-amber-500/40 text-amber-400',
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="min-w-0 leading-snug">{message}</p>
    </output>
  )
}
