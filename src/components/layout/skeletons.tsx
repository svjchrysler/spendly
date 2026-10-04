import { Skeleton } from '@/components/ui/skeleton'
import { List, ListRow, ListSection } from '@/components/ui/list'
import { cn } from '@/lib/utils'

function Bone({
  className,
  style,
}: Readonly<{ className?: string; style?: React.CSSProperties }>) {
  return <Skeleton className={className} style={style} />
}

/*
  Los skeletons se componen sobre los mismos primitivos que las pantallas
  (`ListRow loading`), así la geometría no puede divergir: era el riesgo de
  deriva más caro del rediseño.
*/
export function ExpenseRowSkeleton() {
  return <ListRow loading leading={<Bone className="size-8 shrink-0 rounded-full" />} subtitle trailing />
}

export function ExpenseListSkeleton({ rows = 5 }: Readonly<{ rows?: number }>) {
  return (
    <List aria-hidden>
      {Array.from({ length: Math.ceil(rows / 3) }, (_, group) => (
        <ListSection
          key={group}
          header={<Bone className="h-3 w-24" />}
          headerTrailing={<Bone className="h-3 w-14" />}
        >
          {Array.from({ length: 3 }, (_, i) =>
            group * 3 + i < rows ? <ExpenseRowSkeleton key={i} /> : null,
          )}
        </ListSection>
      ))}
    </List>
  )
}

export function ExpenseFiltersSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Bone className="h-11 w-full rounded-full" />
      <div className="flex gap-2 overflow-hidden">
        {['w-16', 'w-24', 'w-28', 'w-24', 'w-20'].map((w, i) => (
          <Bone key={`${w}-${i}`} className={`h-9 ${w} shrink-0 rounded-full`} />
        ))}
      </div>
    </div>
  )
}

export function CategoryAllocationSkeleton({ rows = 5 }: Readonly<{ rows?: number }>) {
  return (
    <div className="list-group" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="list-row">
          <Bone className="size-8 shrink-0 rounded-lg" />
          <div className="list-row__body gap-2">
            <div className="flex items-center justify-between gap-3">
              <Bone className={`h-3.5 ${i % 2 === 0 ? 'w-24' : 'w-16'}`} />
              <Bone className="h-3.5 w-16" />
            </div>
            <Bone className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SpendingHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-group-surface" aria-hidden>
      <div className="space-y-3 p-4">
        <Bone className="h-3.5 w-32" />
        <Bone className="h-11 w-[70%] sm:h-12" />
        <Bone className="mt-2 h-2 w-full rounded-full" />
        <Bone className="h-3.5 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-separator bg-separator">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2 bg-group-surface px-4 py-3">
            <Bone className="h-3 w-20" />
            <Bone className="h-5 w-[65%]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn('surface-card', className)} aria-hidden>
      <div className="mb-4 flex items-end justify-between">
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-20" />
      </div>
      <div className="flex h-52 items-end gap-2 sm:h-56 sm:gap-3 lg:h-64">
        {[40, 65, 45, 80, 55, 90].map((h) => (
          // ponytail: fixed heights mirror bar chart silhouette
          <Bone key={h} className="flex-1 rounded-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function MastheadSkeleton() {
  return (
    <div className="pb-3" aria-hidden>
      <Bone className="h-9 w-40" />
      <div className="mt-0.5 flex min-h-11 items-center justify-between">
        <Bone className="h-4 w-28" />
        <Bone className="h-10 w-[5.5rem] rounded-full" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-2" aria-busy="true" aria-label="Cargando resumen">
      <MastheadSkeleton />
      <div className="grid gap-7 @4xl/main:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] @4xl/main:items-start @4xl/main:gap-8">
        <div className="flex min-w-0 flex-col gap-7">
          <SpendingHeroSkeleton />
          <div className="space-y-2.5">
            <Bone className="mx-1 h-5 w-28" />
            <div className="list-group">
              {Array.from({ length: 4 }, (_, i) => (
                <ExpenseRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <Bone className="mx-1 h-5 w-32" />
          <CategoryAllocationSkeleton />
        </div>
      </div>
    </div>
  )
}

export function AnalisisPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-3" aria-busy="true" aria-label="Cargando análisis">
      <MastheadSkeleton />
      <div className="grid gap-7 @4xl/main:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] @4xl/main:items-start @4xl/main:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <Bone className="h-9 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] bg-separator @xl/main:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="space-y-2 bg-group-surface px-4 py-3">
                <Bone className="h-3 w-20" />
                <Bone className="h-5 w-[70%]" />
                <Bone className="h-3 w-16" />
              </div>
            ))}
          </div>
          <ChartSkeleton />
        </div>
        <div className="space-y-2.5">
          <Bone className="mx-1 h-5 w-32" />
          <div className="surface-card flex justify-center">
            <Bone className="size-44 rounded-full" />
          </div>
          <CategoryAllocationSkeleton />
        </div>
      </div>
    </div>
  )
}

export function ExpensesPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-3" aria-busy="true" aria-label="Cargando gastos">
      <MastheadSkeleton />
      <div className="grid gap-5 @4xl/main:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] @4xl/main:items-start @4xl/main:gap-8 @6xl/main:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="order-1 space-y-4 @4xl/main:order-2">
          <ExpenseFiltersSkeleton />
          <div className="flex items-center justify-between px-1">
            <Bone className="h-3.5 w-28" />
            <Bone className="h-5 w-24" />
          </div>
        </div>
        <div className="order-2 @4xl/main:order-1">
          <ExpenseListSkeleton rows={6} />
        </div>
      </div>
    </div>
  )
}

export function CategoryListSkeleton({ rows = 8 }: Readonly<{ rows?: number }>) {
  return (
    <List aria-hidden>
      <ListSection>
        {Array.from({ length: rows }, (_, i) => (
          <ListRow
            key={i}
            loading
            separatorInset="4rem"
            leading={<Bone className="size-9 rounded-lg" />}
            // La fila real lleva el uso del mes debajo del nombre
            subtitle=""
          />
        ))}
      </ListSection>
    </List>
  )
}

export function ExpenseFormSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-1" aria-busy="true" aria-label="Cargando formulario">
      <div className="flex flex-col items-center gap-2 pt-1 pb-2">
        <Bone className="h-3 w-12" />
        <Bone className="h-14 w-44" />
      </div>
      <Bone className="h-12 w-full rounded-xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <Bone key={i} className="h-11 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <Bone className="h-11 w-full rounded-full" />
      <Bone className="h-12 w-full rounded-full" />
    </div>
  )
}

