import { useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpsertBudget } from '@/hooks/useMonthlyStats'
import { useMonth } from '@/contexts/MonthContext'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SpendingHeroProps {
  spent: number
  transactionCount: number
  budget: number | null
  topCategory?: { name: string; total: number } | null
}

export function SpendingHero({
  spent,
  transactionCount,
  budget,
  topCategory,
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
    <button
      type="button"
      className="pressable cursor-pointer text-sm text-muted-foreground hover:text-primary"
      onClick={() => setEditingBudget(true)}
    >
      Definir presupuesto
    </button>
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

  return (
    <section className="space-y-8">
      <div className="space-y-2.5">
        <motion.p
          key={spent}
          initial={reduceMotion ? false : { opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="stat-value"
        >
          {formatCurrency(spent)}
        </motion.p>
        {budgetHint}
      </div>

      <div className="grid grid-cols-3 gap-5 sm:gap-8">
        <div className="metric-cell">
          <p className="metric-cell-label">Promedio / día</p>
          <p className="metric-cell-value">{formatCurrency(dailyAvg)}</p>
        </div>
        <div className="metric-cell">
          <p className="metric-cell-label">Gastos</p>
          <p className="metric-cell-value">{transactionCount}</p>
        </div>
        <div className="metric-cell">
          <p className="metric-cell-label">Días</p>
          <p className="metric-cell-value">
            {dayOfMonth}/{daysInMonth}
          </p>
        </div>
      </div>

      {topCategory ? (
        <div className="metric-cell sm:hidden">
          <p className="metric-cell-label">Categoría principal</p>
          <p className="metric-cell-value truncate">{topCategory.name}</p>
        </div>
      ) : null}
    </section>
  )
}
