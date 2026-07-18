import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function Bone({
  className,
  style,
}: Readonly<{ className?: string; style?: React.CSSProperties }>) {
  return <Skeleton className={className} style={style} />
}

export function ExpenseRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Bone className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bone className="h-3.5 w-[42%]" />
        <Bone className="h-3 w-[28%]" />
      </div>
      <Bone className="h-4 w-16 shrink-0" />
    </div>
  )
}

export function ExpenseListSkeleton({ rows = 5 }: Readonly<{ rows?: number }>) {
  return (
    <div className="space-y-5" aria-hidden>
      {Array.from({ length: Math.ceil(rows / 3) }, (_, group) => (
        <section key={group}>
          <div className="mb-1 flex items-center justify-between pb-2">
            <Bone className="h-2.5 w-24" />
            <Bone className="h-3.5 w-14" />
          </div>
          <div className="divide-y divide-border/25">
            {Array.from({ length: 3 }, (_, i) =>
              group * 3 + i < rows ? <ExpenseRowSkeleton key={i} /> : null,
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ExpenseFiltersSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <Bone className="h-9 w-full rounded-none" />
      <div className="flex gap-2 overflow-hidden">
        {['w-16', 'w-24', 'w-20', 'w-28', 'w-24'].map((w, i) => (
          <Bone key={`${w}-${i}`} className={`h-9 ${w} shrink-0 rounded-full`} />
        ))}
      </div>
    </div>
  )
}

export function CategoryAllocationSkeleton({
  fill = false,
}: Readonly<{ fill?: boolean }>) {
  return (
    <div
      className={cn(fill ? 'flex h-full min-h-0 flex-col' : 'space-y-5')}
      aria-hidden
    >
      <Bone className="h-2.5 w-20 shrink-0" />
      <div
        className={cn(
          fill
            ? 'mt-4 flex min-h-0 flex-1 flex-col justify-evenly gap-5'
            : 'space-y-5',
        )}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bone className="size-2 rounded-full" />
                <Bone className={`h-3.5 ${i % 2 === 0 ? 'w-24' : 'w-16'}`} />
              </div>
              <Bone className="h-3.5 w-14" />
            </div>
            <Bone className={cn('w-full rounded-full', fill ? 'h-2' : 'h-1')} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SpendingHeroSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-7" aria-hidden>
      <div className="space-y-3">
        <Bone className="h-2.5 w-16" />
        <Bone className="h-14 w-[78%] sm:h-16" />
        <Bone className="h-3.5 w-48" />
        <Bone className="mt-4 h-2 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-5 border-t border-border/80 pt-5 sm:grid-cols-4 sm:gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-6 w-[70%]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={className} aria-hidden>
      <div className="mb-4 flex items-end justify-between">
        <Bone className="h-2.5 w-28" />
        <Bone className="h-3 w-20" />
      </div>
      <div className="flex h-52 items-end gap-2 sm:h-56 sm:gap-3 lg:h-64">
        {[40, 65, 45, 80, 55, 90].map((h) => (
          // ponytail: fixed heights mirror bar chart silhouette
          <Bone key={h} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function MastheadSkeleton() {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4" aria-hidden>
      <div className="space-y-2.5">
        <Bone className="h-2.5 w-20" />
        <Bone className="h-9 w-52 sm:h-10 sm:w-64" />
      </div>
      <div className="flex items-center gap-1 pb-1">
        <Bone className="size-9 rounded-full" />
        <Bone className="size-9 rounded-full" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div
      className="flex min-h-[calc(100dvh-var(--app-header-h)-env(safe-area-inset-top)-5.5rem)] flex-col gap-4 pb-2 md:min-h-[calc(100dvh-var(--app-header-h)-env(safe-area-inset-top)-3.5rem)] lg:gap-5"
      aria-busy="true"
      aria-label="Cargando resumen"
    >
      <MastheadSkeleton />
      <div className="grid min-h-0 flex-1 gap-6 pt-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-8 xl:gap-10">
        <div className="flex min-h-0 flex-col gap-6 lg:gap-8">
          <SpendingHeroSkeleton />
          <div className="flex min-h-0 flex-1 flex-col border-t border-border/70 pt-5">
            <div className="mb-1 flex items-baseline justify-between">
              <Bone className="h-2.5 w-36" />
              <Bone className="h-3 w-16" />
            </div>
            <div className="flex flex-1 flex-col justify-evenly divide-y divide-border/25">
              {Array.from({ length: 4 }, (_, i) => (
                <ExpenseRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
        <div className="ledger-aside flex min-h-0 flex-col border-t border-border/70 pt-5 lg:border-t-0 lg:pt-0">
          <CategoryAllocationSkeleton fill />
        </div>
      </div>
    </div>
  )
}

export function AnalisisPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8"
      aria-busy="true"
      aria-label="Cargando análisis"
    >
      <MastheadSkeleton />
      <div className="grid grid-cols-2 gap-4 border-b border-border/70 pb-5 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Bone className="h-2.5 w-20" />
            <Bone className="h-6 w-[70%]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 border-b border-border/70 pb-5 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-6 w-[75%]" />
            <Bone className="h-2.5 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8 xl:gap-10">
        <div className="flex min-w-0 flex-col gap-5">
          <ChartSkeleton />
          <section className="border-t border-border/70 pt-5">
            <Bone className="mb-3 h-2.5 w-24" />
            <div className="divide-y divide-border/25">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <Bone className={`h-3.5 ${i % 2 === 0 ? 'w-28' : 'w-24'}`} />
                  <Bone className="h-3.5 w-24" />
                </div>
              ))}
            </div>
          </section>
          <section className="border-t border-border/70 pt-5">
            <Bone className="mb-3 h-2.5 w-32" />
            <Bone className="mb-4 h-44 w-full" />
            <Bone className="mb-3 h-2.5 w-36" />
            <Bone className="mb-4 h-40 w-full" />
            <Bone className="mb-3 h-2.5 w-40" />
            <Bone className="h-44 w-full" />
          </section>
        </div>
        <section className="ledger-aside min-w-0 space-y-5 border-t border-border/70 pt-5 lg:border-t-0 lg:pt-0">
          <div className="flex items-center gap-4">
            <Bone className="size-36 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <Bone className="h-3 w-20" />
                  <Bone className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
          <CategoryAllocationSkeleton />
          <section className="border-t border-border/70 pt-5">
            <Bone className="mb-3 h-2.5 w-28" />
            <div className="divide-y divide-border/25">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="space-y-1.5">
                    <Bone className="h-3.5 w-28" />
                    <Bone className="h-2.5 w-20" />
                  </div>
                  <Bone className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}

export function ExpensesPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8" aria-busy="true" aria-label="Cargando gastos">
      <MastheadSkeleton />
      <div className="grid gap-6 pt-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="ledger-aside order-1 space-y-5 lg:order-2">
          <section className="space-y-3">
            <Bone className="h-2.5 w-24" />
            <Bone className="h-10 w-44" />
            <Bone className="h-3.5 w-36" />
          </section>
          <section className="border-t border-border/70 pt-4">
            <ExpenseFiltersSkeleton />
          </section>
        </div>
        <div className="order-2 lg:order-1">
          <ExpenseListSkeleton rows={6} />
        </div>
      </div>
    </div>
  )
}

export function CategoryListSkeleton({ rows = 8 }: Readonly<{ rows?: number }>) {
  return (
    <div className="grid pt-1 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-12" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-2 border-b border-border/40 py-3">
          <div className="flex items-center gap-3">
            <Bone className="size-10 rounded-full" />
            <Bone className={`h-4 ${i % 2 === 0 ? 'w-28' : 'w-20'}`} />
          </div>
          <div className="flex gap-1">
            <Bone className="size-8 rounded-md" />
            <Bone className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CategoriesPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8" aria-busy="true" aria-label="Cargando categorías">
      <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4">
        <div className="space-y-2.5">
          <Bone className="h-2.5 w-28" />
          <Bone className="h-9 w-44 sm:h-10" />
        </div>
        <Bone className="h-10 w-24 rounded-lg sm:w-40" />
      </div>
      <CategoryListSkeleton />
    </div>
  )
}

export function ExpenseFormSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Cargando formulario">
      <div className="space-y-3 py-4">
        <Bone className="mx-auto h-3 w-16" />
        <Bone className="mx-auto h-14 w-40" />
      </div>
      <Bone className="h-11 w-full rounded-xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <Bone key={i} className="h-16 w-20 shrink-0 rounded-xl" />
        ))}
      </div>
      <Bone className="h-11 w-full rounded-xl" />
      <Bone className="h-12 w-full rounded-full" />
    </div>
  )
}
