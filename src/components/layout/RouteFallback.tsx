import { Skeleton } from '@/components/ui/skeleton'

export function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <span
            className="size-2 animate-pulse rounded-full bg-primary shadow-[0_0_12px_rgba(92,219,149,0.6)]"
            aria-hidden
          />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  )
}
