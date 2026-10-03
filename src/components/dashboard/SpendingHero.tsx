import { ChevronRight } from 'lucide-react'
import { AnimatedAmount } from '@/components/ui/animated-amount'
import { Progress } from '@/components/ui/progress'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { useSettings } from '@/components/settings/settings-context'
import { useMonth } from '@/contexts/MonthContext'
import { dailyBudgetRemaining, projectedMonthSpend } from '@/lib/month-insights'
import { formatCurrency, formatMonthYear } from '@/lib/format'
import { cn } from '@/lib/utils'

interface SpendingHeroProps {
  spent: number
  transactionCount: number
  budget: number | null
}

function Metric({
  label,
  value,
  tone,
}: Readonly<{ label: string; value: string; tone?: 'destructive' }>) {
  return (
    <div className="metric-cell bg-group-surface px-4 py-3">
      <p className="metric-cell-label">{label}</p>
      <p className={cn('metric-cell-value', tone === 'destructive' && 'text-destructive')}>
        {value}
      </p>
    </div>
  )
}

/**
 * La pregunta de la app en una tarjeta: cuánto llevás, cuánto te queda y a
 * dónde va el mes si el ritmo no cambia. Como el saldo de Wallet: la cifra en
 * grande, el contexto en una línea y el detalle en celdas.
 */
export function SpendingHero({
  spent,
  transactionCount,
  budget,
}: Readonly<SpendingHeroProps>) {
  const { year, month, monthKey } = useMonth()
  const { openSettings } = useSettings()

  const remaining = budget != null ? budget - spent : null
  const overBudget = remaining != null && remaining < 0
  const percentage = budget && budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const daysInMonth = new Date(year, month, 0).getDate()
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth
  const dailyAvg = dayOfMonth > 0 ? spent / dayOfMonth : 0
  const projected = projectedMonthSpend(spent, dayOfMonth, daysInMonth)
  const perDayLeft = dailyBudgetRemaining(budget, spent, dayOfMonth, daysInMonth)
  const daysLeft = Math.max(daysInMonth - dayOfMonth, 0)
  const monthName = formatMonthYear(year, month).split(' ')[0]

  return (
    // `reveal`: la tarjeta sube a su lugar cuando reemplaza al skeleton, así
    // se lee como "llegaron los datos" y no como un parpadeo de layout
    <section className="reveal min-w-0 space-y-3">
      <div className="overflow-hidden rounded-[1.25rem] bg-group-surface">
        <div className="space-y-3 p-4 pb-4">
          <p className="text-subhead text-label-secondary">Gastado en {monthName}</p>
          {/* El total viaja hasta su valor: al guardar un gasto o al saltar de
              mes se ve cuánto se movió. `vt-month-total`: en Gastos el mismo
              número vive en otro tamaño y lugar; con el nombre compartido no
              se funde, se muda. */}
          <p className="stat-value vt-month-total">
            <AnimatedAmount value={spent} />
          </p>

          {budget != null && budget > 0 ? (
            <div className="space-y-2 pt-1">
              <Progress
                value={Math.max(percentage, 2) / 100}
                tone={overBudget ? 'destructive' : 'default'}
                label="Presupuesto usado"
              />
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={cn(
                    'min-w-0 truncate text-subhead font-semibold',
                    overBudget ? 'text-destructive' : 'text-primary',
                  )}
                >
                  {overBudget
                    ? `${formatCurrency(Math.abs(remaining!))} de más`
                    : `${formatCurrency(remaining!)} disponibles`}
                </p>
                <p className="shrink-0 font-ledger text-subhead text-label-secondary">
                  {Math.round(percentage)}%
                </p>
              </div>
              <button
                type="button"
                className="pressable -mx-1 -my-2 inline-flex cursor-pointer items-center gap-0.5 rounded-full px-1 py-2 text-subhead text-label-secondary hover:text-label"
                onClick={() => openSettings('presupuesto')}
                aria-label={`Editar presupuesto de ${formatCurrency(budget)}`}
              >
                Presupuesto de {formatCurrency(budget)}
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pressable -mx-1 inline-flex cursor-pointer items-center gap-0.5 rounded-full px-1 py-1 text-subhead font-medium text-primary"
              onClick={() => openSettings('presupuesto')}
            >
              Definir presupuesto
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Celdas separadas por hairlines: el gap de 1px deja ver el separador
            de fondo, como las celdas de una lista. `key` por mes: la cascada
            se repite al cambiar de mes y dice que son la lectura de ese mes. */}
        <div key={monthKey} className="stagger grid grid-cols-2 gap-px border-t border-separator bg-separator">
          <Metric label="Promedio por día" value={formatCurrency(dailyAvg)} />
          <Metric
            label={isCurrentMonth ? 'Proyección del mes' : 'Total del mes'}
            value={formatCurrency(isCurrentMonth ? projected : spent)}
            tone={budget != null && isCurrentMonth && projected > budget ? 'destructive' : undefined}
          />
          {budget != null ? (
            <Metric
              label="Disponible por día"
              value={perDayLeft == null ? '—' : formatCurrency(Math.max(perDayLeft, 0))}
            />
          ) : (
            <Metric label="Gastos" value={String(transactionCount)} />
          )}
          <Metric
            label={isCurrentMonth ? 'Días restantes' : 'Días del mes'}
            value={String(isCurrentMonth ? daysLeft : daysInMonth)}
          />
        </div>
      </div>

      {/* Fuera de la tarjeta: una alerta de tope no se esconde entre datos */}
      <MonthlyCapAlert spent={spent} />
    </section>
  )
}
