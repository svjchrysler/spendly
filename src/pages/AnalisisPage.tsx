import { lazy, Suspense, type ReactNode } from 'react'
import {
  AnalisisPageSkeleton,
  CategoryAllocationSkeleton,
  ChartSkeleton,
} from '@/components/layout/skeletons'
import { CategoryAllocation } from '@/components/charts/CategoryAllocation'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { useMonth } from '@/contexts/MonthContext'
import { useMonthlyHistory, useMonthlyStats } from '@/hooks/useMonthlyStats'

const MonthlyBar = lazy(() =>
  import('@/components/charts/MonthlyBar').then((module) => ({
    default: module.MonthlyBar,
  })),
)

export function AnalisisPage() {
  const { year, month } = useMonth()
  const { data: stats, isLoading: statsLoading } = useMonthlyStats(year, month)
  const { data: history, isLoading: historyLoading } = useMonthlyHistory()

  const spent = stats?.total ?? 0
  const breakdown = stats?.categoryBreakdown ?? []

  if (statsLoading && historyLoading) {
    return <AnalisisPageSkeleton />
  }

  let historyPanel: ReactNode = (
    <p className="py-8 text-sm text-muted-foreground">Sin historial aún</p>
  )
  if (historyLoading) {
    historyPanel = <ChartSkeleton />
  } else if (history && history.length > 0) {
    historyPanel = (
      <Suspense fallback={<ChartSkeleton />}>
        <MonthlyBar data={history} />
      </Suspense>
    )
  }

  return (
    <div className="page-stack space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="stat-label">Análisis</p>
        <MonthPicker />
      </div>

      {/* ponytail: same desktop split as Resumen — chart | asignación */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-x-16">
        <section className="min-w-0 lg:border-r lg:pr-12 xl:pr-16">{historyPanel}</section>
        <section className="min-w-0 border-t border-border pt-6 lg:border-t-0 lg:pt-0">
          {statsLoading ? (
            <CategoryAllocationSkeleton />
          ) : (
            <CategoryAllocation data={breakdown} total={spent} />
          )}
        </section>
      </div>
    </div>
  )
}
