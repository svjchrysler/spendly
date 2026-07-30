import { useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MonthlyCapAlert } from '@/components/dashboard/MonthlyCapAlert'
import { useUpsertBudget } from '@/hooks/useMonthlyStats'
import { useMonth } from '@/contexts/MonthContext'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SpendingHeroProps {
  spent: number
  transactionCount: number
  budget: number | null
}

export function SpendingHero({
  spent,
  transactionCount,
  budget,
}: Readonly<SpendingHeroProps>) {
  const { year, month } = useMonth()
  const upsertBudget = useUpsertBudget()
  const reduceMotion = useReducedMotion()
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetValue, setBudgetValue] = useState(budget?.toString() ?? '')

  const remaining = budget != null ? budget - spent : null
  const overBudget = remaining != null && remaining < 0
  const percentage = budget && budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const daysInMonth = new Date(year, month, 0).getDate()
  const now = new Date()
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth
  const dailyAvg = dayOfMonth > 0 ? spent / dayOfMonth : 0

  async function handleSaveBudget() {
    const amount = Number.parseFloat(budgetValue)
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Ingresa un presupuesto válido')
      return
    }
    try {
      await upsertBudget.mutateAsync({ year, month, amount })
      toast.success('Presupuesto actualizado')
      setEditingBudget(false)
    } catch {
      toast.error('No se pudo guardar el presupuesto')
    }
  }

  let budgetHint: ReactNode = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="cursor-pointer"
      onClick={() => setEditingBudget(true)}
    >
      Definir presupuesto
    </Button>
  )

  if (budget != null && !editingBudget) {
    budgetHint = (
      <p
        className={cn(
          'text-sm font-medium tabular-nums',
          overBudget ? 'text-destructive' : 'text-primary',
        )}
      >
        {overBudget
          ? `${formatCurrency(Math.abs(remaining!))} sobre presupuesto · ${Math.round(percentage)}%`
          : `${formatCurrency(remaining!)} disponibles · ${Math.round(percentage)}% usado`}
        <button
          type="button"
          className="pressable ml-2 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => {
            setBudgetValue(budget.toString())
            setEditingBudget(true)
          }}
        >
          Editar
        </button>
      </p>
    )
  } else if (editingBudget) {
    budgetHint = (
      <div className="flex max-w-sm flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={budgetValue}
          onChange={(e) => setBudgetValue(e.target.value)}
          placeholder="Presupuesto"
          className="h-9 border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-primary/50 focus-visible:ring-0"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={handleSaveBudget}
            disabled={upsertBudget.isPending}
          >
            Guardar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="cursor-pointer"
            onClick={() => setEditingBudget(false)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  // Firma visual: el resumen del mes como recibo (borde perforado abajo)
  return (
    <div className="receipt-edge rounded-t-lg bg-card px-4 pt-5 pb-5 shadow-[0_14px_28px_-20px_var(--shadow)] sm:px-6 sm:pt-6 sm:pb-6">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="stat-label">Gastado</p>
          <p className="stat-label font-ledger text-muted-foreground/70">
            Recibo · {String(month).padStart(2, '0')}/{year}
          </p>
        </div>
        <motion.p
          key={spent}
          initial={reduceMotion ? false : { opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="stat-value leading-none lg:text-[3.5rem]"
        >
          {formatCurrency(spent)}
        </motion.p>
        {budgetHint}
        {budget != null && budget > 0 && !editingBudget ? (
          <div className="bar-track mt-4 h-2 w-full">
            <div
              className={cn('bar-fill', overBudget ? 'bg-destructive' : 'bg-primary')}
              style={{ width: `${Math.max(percentage, 2)}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-dashed border-border pt-4 sm:grid-cols-4 sm:gap-6">
        <div className="metric-cell space-y-2">
          <p className="metric-cell-label">Promedio / día</p>
          <p className="metric-cell-value">{formatCurrency(dailyAvg)}</p>
        </div>
        <div className="metric-cell space-y-2">
          <p className="metric-cell-label">Ticket medio</p>
          <p className="metric-cell-value">
            {formatCurrency(transactionCount > 0 ? spent / transactionCount : 0)}
          </p>
        </div>
        <div className="metric-cell space-y-2">
          <p className="metric-cell-label">Gastos</p>
          <p className="metric-cell-value">{transactionCount}</p>
        </div>
        <div className="metric-cell space-y-2">
          <p className="metric-cell-label">Días</p>
          <p className="metric-cell-value">
            {dayOfMonth}/{daysInMonth}
          </p>
        </div>
      </div>

      <MonthlyCapAlert spent={spent} />
    </div>
  )
}
