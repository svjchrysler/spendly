import { Skeleton } from '@/components/ui/skeleton'

export function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="mx-auto h-5 w-24" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}
