import { useState } from 'react'
import { toast } from 'sonner'
import { ExpenseAmountInput } from '@/components/expenses/ExpenseAmountInput'
import { useMonth } from '@/contexts/MonthContext'
import { useMonthlyBudget, usePreviousBudget, useUpsertBudget } from '@/hooks/useMonthlyStats'
import { formatCurrency, formatMonthYear } from '@/lib/format'

interface BudgetFormProps {
  readonly formId: string
  readonly onSaved: () => void
}

/**
 * Presupuesto del mes que estás mirando. Si ese mes no tiene uno, ofrece el
 * último que definiste con un tap — antes había que volver a tipear el mismo
 * número todos los meses.
 */
export function BudgetForm({ formId, onSaved }: BudgetFormProps) {
  const { year, month } = useMonth()
  const { data: budget } = useMonthlyBudget(year, month)
  const { data: previousBudget } = usePreviousBudget(year, month, budget == null)
  const upsertBudget = useUpsertBudget()
  const [amount, setAmount] = useState<number | undefined>(budget?.amount ?? undefined)
  const monthLabel = formatMonthYear(year, month)

  async function save(value: number | undefined) {
    if (value == null || Number.isNaN(value) || value < 0) {
      toast.error('Ingresa un presupuesto válido')
      return
    }
    try {
      await upsertBudget.mutateAsync({ year, month, amount: value })
      toast.success('Presupuesto actualizado')
      onSaved()
    } catch {
      toast.error('No se pudo guardar el presupuesto')
    }
  }

  return (
    <form
      id={formId}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!upsertBudget.isPending) void save(amount)
      }}
      className="space-y-4 pb-1"
    >
      <ExpenseAmountInput
        id="budget-amount"
        label={`Presupuesto de ${monthLabel}`}
        autoFocus
        value={amount}
        onChange={setAmount}
      />

      {previousBudget && budget == null ? (
        <div className="list-group">
          <button
            type="button"
            className="list-row list-row--tappable"
            disabled={upsertBudget.isPending}
            onClick={() => void save(previousBudget.amount)}
          >
            <span className="list-row__body">
              <span className="text-body text-primary">
                Usar {formatCurrency(previousBudget.amount)}
              </span>
              <span className="text-subhead text-label-secondary">
                El mismo que en {formatMonthYear(previousBudget.year, previousBudget.month)}
              </span>
            </span>
          </button>
        </div>
      ) : null}

      <p className="px-4 text-footnote text-label-secondary">
        Resumen te muestra cuánto te queda, cuánto puedes gastar por día y si el
        ritmo del mes lo va a pasar.
      </p>
    </form>
  )
}
