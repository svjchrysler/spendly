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
        'mb-2 flex items-start gap-2.5 border-b py-3.5 text-sm leading-snug',
        level === 'over'
          ? 'border-destructive/35 text-destructive'
          : 'border-amber-500/35 text-amber-300',
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0">{message}</p>
    </output>
  )
}
