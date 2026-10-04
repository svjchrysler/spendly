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

  // Aviso tintado de iOS: debajo de la tarjeta, con el color del nivel
  return (
    <output
      // key por nivel: cruzar el umbral vuelve a disparar la entrada, así el
      // cambio de "vas justo" a "te pasaste" se nota aunque ya hubiera aviso
      key={level}
      className={cn(
        'notice-in flex items-start gap-2.5 rounded-xl px-4 py-3 text-subhead',
        level === 'over' ? 'bg-destructive/10 text-destructive' : 'bg-warning-muted text-warning',
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0">{message}</p>
    </output>
  )
}
