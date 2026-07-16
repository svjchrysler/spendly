import { Skeleton } from '@/components/ui/skeleton'

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

export function CategoryAllocationSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <Bone className="h-2.5 w-20" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Bone className="size-2 rounded-full" />
              <Bone className={`h-3.5 ${i % 2 === 0 ? 'w-24' : 'w-16'}`} />
            </div>
            <Bone className="h-3.5 w-14" />
          </div>
          <Bone className="h-1 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function SpendingHeroSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6" aria-hidden>
      <div className="space-y-2">
        <Bone className="h-12 w-[72%] sm:h-14" />
        <Bone className="h-3.5 w-40" />
        <Bone className="mt-3 h-1.5 max-w-md w-full rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-border/80 pt-4 sm:gap-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-5 w-[70%]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function InsightsGridSkeleton() {
  return (
    <section
      className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="metric-cell space-y-1.5">
          <Bone className="h-2.5 w-16" />
          <Bone className="h-6 w-[75%]" />
          <Bone className="h-3 w-20" />
        </div>
      ))}
    </section>
  )
}

export function ChartSkeleton({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={className} aria-hidden>
      <div className="mb-4 flex items-end justify-between">
        <Bone className="h-2.5 w-28" />
        <Bone className="h-3 w-20" />
      </div>
      <div className="flex h-52 items-end gap-2 sm:h-56 sm:gap-3">
        {[40, 65, 45, 80, 55, 90].map((h) => (
          // ponytail: fixed heights mirror bar chart silhouette
          <Bone key={h} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-1 pb-4 lg:pb-8" aria-busy="true" aria-label="Cargando resumen">
      <div className="flex items-center justify-between gap-3 pb-2">
        <Bone className="h-2.5 w-20" />
        <Bone className="h-8 w-36 rounded-full" />
      </div>
      <div className="grid gap-8 pt-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-x-12 xl:gap-x-16">
        <div className="flex flex-col gap-6 lg:gap-7">
          <SpendingHeroSkeleton />
          <InsightsGridSkeleton />
        </div>
        <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12 xl:pl-14">
          <CategoryAllocationSkeleton />
        </div>
      </div>
    </div>
  )
}

export function AnalisisPageSkeleton() {
  return (
    <div className="page-stack space-y-6" aria-busy="true" aria-label="Cargando análisis">
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-2.5 w-20" />
        <Bone className="h-8 w-36 rounded-full" />
      </div>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-x-16">
        <section className="min-w-0 lg:border-r lg:pr-12 xl:pr-16">
          <ChartSkeleton />
        </section>
        <section className="min-w-0 border-t border-border pt-6 lg:border-t-0 lg:pt-0">
          <CategoryAllocationSkeleton />
        </section>
      </div>
    </div>
  )
}

export function ExpensesPageSkeleton() {
  return (
    <div className="page-stack space-y-6" aria-busy="true" aria-label="Cargando gastos">
      <section className="section-rule flex items-start justify-between gap-3 pb-6">
        <div className="space-y-3">
          <Bone className="h-10 w-44 sm:h-12 sm:w-56" />
          <Bone className="h-3.5 w-36" />
        </div>
        <Bone className="h-8 w-32 rounded-full" />
      </section>
      <ExpenseFiltersSkeleton />
      <ExpenseListSkeleton rows={6} />
    </div>
  )
}

export function CategoryListSkeleton({ rows = 6 }: Readonly<{ rows?: number }>) {
  return (
    <div className="divide-y divide-border/30" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-2 py-3">
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
    <div className="page-stack space-y-2" aria-busy="true" aria-label="Cargando categorías">
      <div className="section-rule flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <Bone className="h-2.5 w-24" />
        <Bone className="h-10 w-full rounded-full sm:w-40" />
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
