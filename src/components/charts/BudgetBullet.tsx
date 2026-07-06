import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { StatLabel } from '@/components/layout/Stat'
import { formatCurrency } from '@/lib/format'
import { useUpsertBudget } from '@/hooks/useMonthlyStats'
import { useMonth } from '@/contexts/MonthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BudgetBulletProps {
  spent: number
  budget: number | null
  compact?: boolean
}

export function BudgetBullet({ spent, budget, compact = false }: BudgetBulletProps) {
  const { year, month } = useMonth()
  const upsertBudget = useUpsertBudget()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(budget?.toString() ?? '')

  const target = budget ?? 0
  const percentage = target > 0 ? Math.min((spent / target) * 100, 100) : 0
  const overBudget = target > 0 && spent > target

  async function handleSave() {
    const amount = parseFloat(value)
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Ingresa un presupuesto válido')
      return
    }

    try {
      await upsertBudget.mutateAsync({ year, month, amount })
      toast.success('Presupuesto actualizado')
      setEditing(false)
    } catch {
      toast.error('No se pudo guardar el presupuesto')
    }
  }

  return (
    <div className={cn(
      'space-y-4',
      compact && 'border-b border-border pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0',
    )}>
      <div className="flex items-center justify-between">
        <StatLabel>Presupuesto</StatLabel>
        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto cursor-pointer px-0 text-xs text-muted-foreground hover:text-primary"
            onClick={() => {
              setValue(budget?.toString() ?? '')
              setEditing(true)
            }}
          >
            {budget ? 'Editar' : 'Definir'}
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            aria-label="Presupuesto mensual"
            className="border-border bg-secondary/50"
          />
          <div className="flex gap-2">
            <Button className="cursor-pointer" onClick={handleSave} disabled={upsertBudget.isPending}>
              Guardar
            </Button>
            <Button variant="ghost" className="cursor-pointer" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {budget ? formatCurrency(budget) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              Gastado: {formatCurrency(spent)}
            </p>
          </div>
          {budget ? (
            <>
              <Progress
                value={percentage}
                className={cn('h-1.5 bg-secondary', overBudget && '[&>div]:bg-destructive')}
              />
              <p
                className={cn(
                  'text-xs tabular-nums',
                  overBudget ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                {overBudget
                  ? `Excedido ${formatCurrency(spent - target)}`
                  : `${Math.round(percentage)}% utilizado`}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Establece tu meta mensual de gasto.
            </p>
          )}
        </>
      )}
    </div>
  )
}
