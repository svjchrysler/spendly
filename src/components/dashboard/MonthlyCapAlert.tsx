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

  // Línea de aviso dentro del recibo: sin caja propia, separada por hairline punteada
  return (
    <output
      // key por nivel: cruzar el umbral vuelve a disparar la entrada, así el
      // cambio de "vas justo" a "te pasaste" se nota aunque ya hubiera aviso
      key={level}
      className={cn(
        'notice-in mt-4 flex items-start gap-2.5 border-t border-dashed border-border pt-3.5 text-sm leading-snug',
        level === 'over' ? 'text-destructive' : 'text-warning',
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0">{message}</p>
    </output>
  )
}
