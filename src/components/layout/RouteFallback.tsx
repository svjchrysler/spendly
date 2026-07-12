import { DashboardSkeleton } from '@/components/layout/skeletons'

export function RouteFallback() {
  return (
    <div className="mx-auto w-full px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 sm:px-6 lg:px-8 xl:px-10">
      <DashboardSkeleton />
    </div>
  )
}
