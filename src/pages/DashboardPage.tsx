import {
  CategoryAllocationSkeleton,
  DashboardSkeleton,
  ExpenseRowSkeleton,
  SpendingHeroSkeleton,
} from '@/components/layout/skeletons'
import { SpendingHero } from '@/components/dashboard/SpendingHero'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { MonthMasthead } from '@/components/layout/MonthPicker'
import { ContentSection } from '@/components/ui/list'
import { useMonth } from '@/contexts/MonthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyBudget, useMonthlyStats } from '@/hooks/useMonthlyStats'

export function DashboardPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: budget } = useMonthlyBudget(year, month)
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(year, month)

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []
  const budgetAmount = budget?.amount ?? null

  if (statsLoading && expensesLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 pb-2">
      <MonthMasthead title="Resumen" />

      {/* Empaquetado arriba en las dos columnas: estirar para llenar el alto
          dejaba huecos (ver pitfalls en AGENTS.md) */}
      <div className="grid gap-7 @4xl/main:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] @4xl/main:items-start @4xl/main:gap-8">
        <div className="flex min-w-0 flex-col gap-7">
          {statsLoading ? (
            <SpendingHeroSkeleton />
          ) : (
            <SpendingHero
              spent={spent}
              expenses={expenses}
              budget={budgetAmount}
            />
          )}

          <ContentSection title="Recientes" action={{ label: 'Ver todo', to: '/gastos' }}>
            {expensesLoading ? (
              <div className="list-group" aria-hidden>
                {Array.from({ length: 4 }, (_, i) => (
                  <ExpenseRowSkeleton key={i} />
                ))}
              </div>
            ) : (
              // Tocables: mismo action sheet / editar / eliminar que Gastos
              <ExpenseList
                expenses={expenses.slice(0, 5)}
                compact
                emptyCta="Agregar tu primer gasto"
              />
            )}
          </ContentSection>
        </div>

        <ContentSection
          title="Por categoría"
          action={{ label: 'Análisis', to: '/analisis' }}
        >
          {statsLoading ? (
            <CategoryAllocationSkeleton />
          ) : (
            <CategoryAllocation data={breakdown} total={spent} limit={5} />
          )}
        </ContentSection>
      </div>
    </div>
  )
}
