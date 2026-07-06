import { useState } from 'react'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { StatLabel } from '@/components/layout/Stat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
}: SpendingHeroProps) {
  const { year, month } = useMonth()
  const upsertBudget = useUpsertBudget()
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

  return (
    <section className="data-panel space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatLabel>Resumen del mes</StatLabel>
        <MonthPicker />
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
          {formatCurrency(spent)}
        </p>
        <p className="text-sm text-muted-foreground">
          {transactionCount} {transactionCount === 1 ? 'gasto' : 'gastos'} registrados
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="metric-chip">
          <p className="metric-chip-label">Promedio / día</p>
          <p className="metric-chip-value">{formatCurrency(dailyAvg)}</p>
        </div>
        <div className="metric-chip">
          <p className="metric-chip-label">Días del mes</p>
          <p className="metric-chip-value">
            {dayOfMonth}/{daysInMonth}
          </p>
        </div>
        <div className="metric-chip col-span-2 sm:col-span-1">
          <p className="metric-chip-label">Categoría principal</p>
          <p className="metric-chip-value truncate">
            {topCategory ? topCategory.name : '—'}
          </p>
        </div>
      </div>

      {budget != null && !editingBudget ? (
        <div className="space-y-2 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Presupuesto</span>
            <div className="flex items-center gap-2">
              <span className="font-medium tabular-nums">{formatCurrency(budget)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto cursor-pointer px-0 text-xs text-muted-foreground hover:text-primary"
                onClick={() => {
                  setBudgetValue(budget.toString())
                  setEditingBudget(true)
                }}
              >
                Editar
              </Button>
            </div>
          </div>
          <Progress
            value={percentage}
            className={cn('h-2 bg-secondary', overBudget && '[&>div]:bg-destructive')}
          />
          <p
            className={cn(
              'text-xs font-medium tabular-nums',
              overBudget ? 'text-destructive' : 'text-primary',
            )}
          >
            {overBudget
              ? `${formatCurrency(Math.abs(remaining!))} sobre el presupuesto`
              : `${formatCurrency(remaining!)} disponibles · ${Math.round(percentage)}% usado`}
          </p>
        </div>
      ) : editingBudget ? (
        <div className="space-y-2 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">Presupuesto mensual</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={budgetValue}
              onChange={(e) => setBudgetValue(e.target.value)}
              placeholder="0.00"
              className="border-border bg-secondary/50"
            />
            <div className="flex gap-2">
              <Button className="cursor-pointer" onClick={handleSaveBudget} disabled={upsertBudget.isPending}>
                Guardar
              </Button>
              <Button variant="ghost" className="cursor-pointer" onClick={() => setEditingBudget(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            Sin presupuesto definido para este mes.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto cursor-pointer px-0 text-xs text-primary hover:text-primary/80"
            onClick={() => setEditingBudget(true)}
          >
            Definir
          </Button>
        </div>
      )}
    </section>
  )
}
