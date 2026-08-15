import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { subscribeScroll } from '@/lib/scroll-store'

/** Ancho revelado al abrir del todo */
const OPEN_W = 88
/** Píxeles antes de decidir si el gesto es horizontal o vertical */
const AXIS_LOCK = 8
/** Resistencia al arrastrar más allá del ancho abierto */
const RESISTANCE = 0.35
/** px/ms a partir de los cuales el flick decide sin importar la posición */
const FLICK_V = 0.35
/** Fracción del ancho de fila que dispara la acción sin soltar en el tope */
const COMMIT_RATIO = 0.6

type Options = {
  enabled: boolean
  onCommit: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Swipe-to-delete estilo iOS, a mano con pointer events.
 *
 * No usa una librería de gestos por dos razones concretas de este código:
 * `content-visibility: auto` en las secciones deja subárboles sin layout, y
 * cualquier librería que mida el box al iniciar el gesto lee cero; y el
 * arbitraje de eje sobre una página que scrollea en `window` necesita
 * `touch-action: pan-y` más un lock manual para no pelear con el scroll.
 *
 * Durante el arrastre se escribe `--swipe-x` directo en el nodo: nada de
 * estado de React por frame.
 */
export function useSwipeActions({ enabled, onCommit, isOpen, onOpenChange }: Options) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const start = useRef({ x: 0, y: 0, t: 0 })
  const axis = useRef<'none' | 'x' | 'y'>('none')
  const offset = useRef(0)
  const dragging = useRef(false)

  const setOffset = useCallback((value: number) => {
    offset.current = value
    nodeRef.current?.style.setProperty('--swipe-x', `${value}px`)
  }, [])

  const settle = useCallback(
    (open: boolean) => {
      nodeRef.current?.removeAttribute('data-dragging')
      setOffset(open ? -OPEN_W : 0)
      onOpenChange(open)
    },
    [onOpenChange, setOffset],
  )

  // El estado abierto lo manda el padre (una sola fila abierta a la vez)
  useEffect(() => {
    if (dragging.current) return
    setOffset(isOpen ? -OPEN_W : 0)
  }, [isOpen, setOffset])

  // Cerrar al scrollear, como iOS. Reusa el store, no agrega listener.
  useEffect(() => {
    if (!isOpen) return
    return subscribeScroll(() => {
      if (!dragging.current) settle(false)
    })
  }, [isOpen, settle])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (!enabled || event.pointerType === 'mouse') return
      start.current = { x: event.clientX, y: event.clientY, t: event.timeStamp }
      axis.current = 'none'
      dragging.current = true
    },
    [enabled],
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      if (!dragging.current) return
      const dx = event.clientX - start.current.x
      const dy = event.clientY - start.current.y

      if (axis.current === 'none') {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return
        // El scroll vertical gana los empates: es el gesto por defecto
        axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (axis.current === 'y') {
          dragging.current = false
          return
        }
        event.currentTarget.setPointerCapture(event.pointerId)
        nodeRef.current?.setAttribute('data-dragging', 'true')
      }

      const base = isOpen ? -OPEN_W : 0
      let next = base + dx
      if (next > 0) next *= RESISTANCE
      if (next < -OPEN_W) next = -OPEN_W + (next + OPEN_W) * RESISTANCE
      setOffset(next)
    },
    [isOpen, setOffset],
  )

  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => {
      if (!dragging.current || axis.current !== 'x') {
        dragging.current = false
        return
      }
      dragging.current = false

      const dx = event.clientX - start.current.x
      const dt = Math.max(event.timeStamp - start.current.t, 1)
      const velocity = dx / dt
      const width = nodeRef.current?.offsetWidth ?? 0

      // Full swipe: dispara sin soltar en el tope, como Mail
      if (width > 0 && Math.abs(offset.current) > width * COMMIT_RATIO) {
        settle(false)
        onCommit()
        return
      }

      if (velocity < -FLICK_V) return settle(true)
      if (velocity > FLICK_V) return settle(false)
      settle(offset.current < -OPEN_W / 2)
    },
    [onCommit, settle],
  )

  return {
    nodeRef,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    openWidth: OPEN_W,
  }
}
