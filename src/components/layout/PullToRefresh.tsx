import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { tapFeedback } from '@/lib/haptics'
import { cn } from '@/lib/utils'

const THRESHOLD = 72
const MAX_PULL = 108
/** El arrastre no mapea 1:1: el freno es lo que da la sensación de goma. */
const RESISTANCE = 0.55
/** Piso de tiempo visible: un refresh instantáneo parece que no pasó nada. */
const MIN_SPIN_MS = 450

/**
 * Pull-to-refresh nativo para el shell mobile.
 *
 * Todo con listeners pasivos: `overscroll-behavior: none` (index.css) ya frena
 * el rubber-band del browser en scrollY 0, así que no hace falta preventDefault
 * y el scroll normal nunca queda bloqueado.
 */
export function PullToRefresh() {
  const queryClient = useQueryClient()
  const [pull, setPull] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const gesture = useRef({ startY: 0, tracking: false, pull: 0, refreshing: false })

  useEffect(() => {
    gesture.current.refreshing = refreshing
  }, [refreshing])

  const run = useCallback(async () => {
    setRefreshing(true)
    tapFeedback()
    try {
      await Promise.all([
        queryClient.refetchQueries({ type: 'active' }),
        new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS)),
      ])
    } finally {
      setRefreshing(false)
    }
  }, [queryClient])

  useEffect(() => {
    // Solo touch: en desktop el gesto no existe y el indicador nunca aparece
    if (!window.matchMedia('(pointer: coarse)').matches) return

    const reset = () => {
      gesture.current.tracking = false
      gesture.current.pull = 0
      setPull(0)
      setDragging(false)
    }

    const onStart = (event: TouchEvent) => {
      if (gesture.current.refreshing || event.touches.length !== 1) return
      if (window.scrollY > 0) return
      // Sheets y diálogos scrollean solos: el gesto es de ellos, no del shell
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('[data-slot="sheet-content"], [role="dialog"]')
      ) {
        return
      }
      gesture.current.startY = event.touches[0].clientY
      gesture.current.tracking = true
    }

    const onMove = (event: TouchEvent) => {
      if (!gesture.current.tracking) return
      // Se scrolleó de verdad: el gesto era scroll, no pull
      if (window.scrollY > 0) {
        reset()
        return
      }
      const delta = event.touches[0].clientY - gesture.current.startY
      if (delta <= 0) {
        gesture.current.pull = 0
        setPull(0)
        setDragging(false)
        return
      }
      const next = Math.min(delta * RESISTANCE, MAX_PULL)
      gesture.current.pull = next
      setPull(next)
      setDragging(true)
    }

    const onEnd = () => {
      if (!gesture.current.tracking) return
      const reached = gesture.current.pull >= THRESHOLD
      reset()
      if (reached) void run()
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [run])

  const progress = Math.min(pull / THRESHOLD, 1)
  const offset = refreshing ? THRESHOLD : pull
  const visible = refreshing || pull > 0

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{
        top: 'calc(var(--app-header-h) + env(safe-area-inset-top))',
        transform: `translate3d(0, ${offset - 44}px, 0)`,
        opacity: visible ? 1 : 0,
        transition: dragging
          ? 'none'
          : 'transform 260ms var(--ease-out-expo), opacity 200ms ease',
      }}
    >
      <output
        aria-live="polite"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-sm"
      >
        <RefreshCw
          aria-hidden
          className={cn('size-4 text-muted-foreground', refreshing && 'animate-spin')}
          style={
            refreshing
              ? undefined
              : {
                  transform: `rotate(${progress * 270}deg)`,
                  opacity: 0.35 + progress * 0.65,
                }
          }
        />
        <span className="sr-only">{refreshing ? 'Actualizando' : ''}</span>
      </output>
    </div>
  )
}
