import { useMemo, type CSSProperties } from 'react'
import { ChevronRight } from 'lucide-react'
import { AnimatedAmount } from '@/components/ui/animated-amount'
import { Progress } from '@/components/ui/progress'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { useSettings } from '@/components/settings/settings-context'
import { useMonth } from '@/contexts/MonthContext'
import { dailyBudgetRemaining, projectedMonthSpend } from '@/lib/month-insights'
import { formatCurrency, formatMonthYear } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ExpenseWithCategory } from '@/types/database'

interface SpendingHeroProps {
  spent: number
  expenses: readonly ExpenseWithCategory[]
  budget: number | null
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="metric-cell bg-group-surface px-3.5 py-3">
      <p className="metric-cell-label truncate">{label}</p>
      <p className="metric-cell-value truncate">{value}</p>
    </div>
  )
}

/**
 * Un gasto por día del mes, en barras. Es la forma del mes de un vistazo:
 * cuándo gastaste, cuánto pesa hoy y cuánto mes queda por delante (los días
 * futuros son puntos, todavía no son datos).
 */
function DayBars({
  totals,
  today,
}: Readonly<{ totals: readonly number[]; today: number | null }>) {
  const max = Math.max(...totals, 0)
  const peakDay = totals.indexOf(max) + 1
  const lastDay = totals.length
  const summary =
    max > 0
      ? `Gasto por día. El más alto fue el día ${peakDay}, con ${formatCurrency(max)}.`
      : 'Gasto por día. Sin movimientos.'

  return (
    <div>
      <div className="day-bars" role="img" aria-label={summary}>
        {totals.map((total, index) => {
          const day = index + 1
          const future = today != null && day > today
          return (
            <span
              key={day}
              className="day-bar"
              data-state={future ? 'future' : day === today ? 'today' : total > 0 ? 'spent' : 'empty'}
              style={
                {
                  '--bar': max > 0 ? total / max : 0,
                  '--bar-i': index,
                } as CSSProperties
              }
            />
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-caption-2 text-label-tertiary tabular-nums" aria-hidden>
        <span>1</span>
        <span>{Math.round(lastDay / 2)}</span>
        <span>{lastDay}</span>
      </div>
    </div>
  )
}

type Insight = { text: string; tone?: 'destructive' | 'positive' }

/**
 * La pregunta de la app, contestada en una frase: cómo viene el mes. Las
 * cifras sueltas (proyección, disponible por día) obligaban a hacer la cuenta;
 * esto la hace y dice el resultado.
 */
function buildInsight(input: {
  spent: number
  count: number
  budget: number | null
  monthName: string
  isCurrentMonth: boolean
  projected: number
  perDayLeft: number | null
  daysLeft: number
  dailyAvg: number
}): Insight {
  const { spent, count, budget, monthName, isCurrentMonth, projected, perDayLeft, daysLeft, dailyAvg } = input
  if (spent <= 0) return { text: 'Todavía no hay gastos registrados este mes.' }

  if (budget != null && budget > 0) {
    const remaining = budget - spent
    if (remaining < 0) {
      return {
        text: `Te pasaste del presupuesto por ${formatCurrency(-remaining)}.`,
        tone: 'destructive',
      }
    }
    if (!isCurrentMonth) {
      return { text: `Cerraste ${monthName} con ${formatCurrency(remaining)} de sobra.`, tone: 'positive' }
    }
    if (projected > budget) {
      return {
        text: `A este ritmo cierras ${monthName} en ${formatCurrency(projected)}: ${formatCurrency(projected - budget)} sobre tu presupuesto.`,
        tone: 'destructive',
      }
    }
    if (daysLeft > 0 && perDayLeft != null) {
      return {
        text: `Vas bien. Puedes gastar ${formatCurrency(perDayLeft)} por día los ${daysLeft} días que quedan.`,
        tone: 'positive',
      }
    }
    return { text: `Último día del mes y quedan ${formatCurrency(remaining)}.`, tone: 'positive' }
  }

  if (isCurrentMonth) {
    return { text: `A este ritmo cierras ${monthName} en ${formatCurrency(projected)}.` }
  }
  return {
    text: `${count} ${count === 1 ? 'gasto' : 'gastos'}, ${formatCurrency(dailyAvg)} por día en promedio.`,
  }
}

/**
 * Portada del mes: la cifra sobre el papel, la frase que la interpreta, la
 * forma del mes día a día y el presupuesto con la marca de dónde deberías ir
 * hoy.
 */
export function SpendingHero({ spent, expenses, budget }: Readonly<SpendingHeroProps>) {
  const { year, month, monthKey } = useMonth()
  const { openSettings } = useSettings()

  const hasBudget = budget != null && budget > 0
  const remaining = budget != null ? budget - spent : null
  const overBudget = remaining != null && remaining < 0
  const percentage = hasBudget ? Math.min((spent / budget) * 100, 100) : 0
  const daysInMonth = new Date(year, month, 0).getDate()
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth
  const dailyAvg = dayOfMonth > 0 ? spent / dayOfMonth : 0
  const projected = projectedMonthSpend(spent, dayOfMonth, daysInMonth)
  const perDayLeft = dailyBudgetRemaining(budget, spent, dayOfMonth, daysInMonth)
  const daysLeft = Math.max(daysInMonth - dayOfMonth, 0)
  const monthName = formatMonthYear(year, month).split(' ')[0]
  // Dónde debería ir el gasto hoy si el presupuesto se repartiera parejo
  const pacePct = (dayOfMonth / daysInMonth) * 100

  const totals = useMemo(() => {
    const days = Array.from({ length: daysInMonth }, () => 0)
    for (const expense of expenses) {
      // `expense_date` es `YYYY-MM-DD`
      const day = Number(expense.expense_date.slice(8, 10))
      if (day >= 1 && day <= daysInMonth) days[day - 1] += Number(expense.amount)
    }
    return days
  }, [expenses, daysInMonth])

  const insight = buildInsight({
    spent,
    count: expenses.length,
    budget,
    monthName,
    isCurrentMonth,
    projected,
    perDayLeft,
    daysLeft,
    dailyAvg,
  })

  return (
    // `reveal`: la portada sube a su lugar cuando reemplaza al skeleton, así
    // se lee como "llegaron los datos" y no como un parpadeo de layout
    <section className="reveal min-w-0 space-y-5">
      <div className="space-y-2 px-1">
        <p className="text-subhead text-label-secondary">Gastado en {monthName}</p>
        {/* El total viaja hasta su valor: al guardar un gasto o al saltar de
            mes se ve cuánto se movió. `vt-month-total`: en Gastos el mismo
            número vive en otro tamaño y lugar; con el nombre compartido no
            se funde, se muda. */}
        <p className="stat-value vt-month-total">
          <AnimatedAmount value={spent} />
        </p>
        <p
          key={`${monthKey}-${insight.tone ?? 'plain'}`}
          className={cn(
            'notice-in max-w-[34rem] pt-1 text-callout text-pretty',
            insight.tone === 'destructive' && 'text-destructive',
            insight.tone === 'positive' && 'text-primary',
            !insight.tone && 'text-label-secondary',
          )}
        >
          {insight.text}
        </p>
      </div>

      <div className="surface-card space-y-4">
        {/* `key` por mes: las barras vuelven a crecer al cambiar de mes */}
        <div key={monthKey}>
          <DayBars totals={totals} today={isCurrentMonth ? dayOfMonth : null} />
        </div>

        {hasBudget ? (
          <div className="space-y-2 border-t border-separator pt-4">
            <div className="relative">
              <Progress
                value={Math.max(percentage, 2) / 100}
                tone={overBudget ? 'destructive' : 'default'}
                label="Presupuesto usado"
              />
              {isCurrentMonth && daysLeft > 0 ? (
                <span className="pace-tick" style={{ left: `${pacePct}%` }} aria-hidden />
              ) : null}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <p
                className={cn(
                  'min-w-0 truncate text-subhead font-semibold',
                  overBudget ? 'text-destructive' : 'text-label',
                )}
              >
                {overBudget
                  ? `${formatCurrency(Math.abs(remaining!))} de más`
                  : `${formatCurrency(remaining!)} disponibles`}
              </p>
              <p className="shrink-0 font-ledger text-subhead text-label-secondary">
                {Math.round(percentage)}%
                {isCurrentMonth && daysLeft > 0 ? (
                  <span className="text-label-tertiary"> · ritmo {Math.round(pacePct)}%</span>
                ) : null}
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
          <div className="border-t border-separator pt-3">
            <button
              type="button"
              className="pressable -mx-1 inline-flex min-h-11 cursor-pointer items-center gap-0.5 rounded-full px-1 text-subhead font-medium text-primary"
              onClick={() => openSettings('presupuesto')}
            >
              Definir presupuesto
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Tres celdas en una hoja, separadas por hairlines. `key` por mes: la
          cascada se repite al cambiar de mes. */}
      <div
        key={monthKey}
        className="stagger grid grid-cols-3 gap-px overflow-hidden rounded-[1.375rem] border-[length:var(--hairline)] border-separator bg-separator"
      >
        <Metric label="Por día" value={formatCurrency(dailyAvg)} />
        <Metric label="Gastos" value={String(expenses.length)} />
        <Metric
          label={isCurrentMonth ? 'Días restantes' : 'Días del mes'}
          value={String(isCurrentMonth ? daysLeft : daysInMonth)}
        />
      </div>

      {/* Fuera de la tarjeta: una alerta de tope no se esconde entre datos */}
      <MonthlyCapAlert spent={spent} />
    </section>
  )
}
