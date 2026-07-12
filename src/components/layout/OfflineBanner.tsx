import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

/** Compact strip when the PWA has no network — data still comes from last cache. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine,
  )

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <output className="flex w-full items-center justify-center gap-2 border-b border-border/80 bg-muted/80 px-4 py-2 text-center text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase backdrop-blur-md">
      <WifiOff className="size-3.5 shrink-0" aria-hidden />
      Sin conexión · mostrando la última información
    </output>
  )
}
