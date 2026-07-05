import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { useUpsertBudget } from '@/hooks/useMonthlyStats'
import { useMonth } from '@/contexts/MonthContext'
import { toast } from 'sonner'

interface BudgetBulletProps {
  spent: number
  budget: number | null
}

export function BudgetBullet({ spent, budget }: BudgetBulletProps) {
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
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Presupuesto mensual</CardTitle>
        {!editing ? (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              setValue(budget?.toString() ?? '')
              setEditing(true)
            }}
          >
            {budget ? 'Editar' : 'Definir'}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              aria-label="Presupuesto mensual"
            />
            <Button
              className="cursor-pointer"
              onClick={handleSave}
              disabled={upsertBudget.isPending}
            >
              Guardar
            </Button>
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastado</p>
                <p className="font-display text-3xl">{formatCurrency(spent)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Meta</p>
                <p className="text-lg font-semibold">
                  {budget ? formatCurrency(budget) : 'Sin definir'}
                </p>
              </div>
            </div>
            {budget ? (
              <>
                <Progress
                  value={percentage}
                  className={overBudget ? '[&>div]:bg-destructive' : ''}
                />
                <p
                  className={`text-sm ${overBudget ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {overBudget
                    ? `Excedido en ${formatCurrency(spent - target)}`
                    : `${Math.round(percentage)}% del presupuesto usado`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Define un presupuesto para seguir tu progreso mensual.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
