import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

/** Fracción del alto del sheet a partir de la cual soltar cierra */
const DISMISS_RATIO = 0.25
/** px/ms hacia abajo que cierran sin importar la posición */
const FLICK_V = 0.7
/** Resistencia al arrastrar hacia arriba (el sheet no crece) */
const RESISTANCE = 0.2

/**
 * Drag-to-dismiss de los bottom sheets. Hasta ahora el grabber era decorativo.
 *
 * El transform va en un nodo anidado y no en el popup: Base UI ya anima el
 * popup con su propio `translate-y` de entrada/salida, y escribir ahí lo
 * pisaría. Anidado, los dos transforms componen.
 *
 * Regla de iOS para el arbitraje: un arrastre que nace en el cuerpo solo
 * mueve el sheet si el contenido ya está scrolleado arriba del todo y el
 * gesto va hacia abajo. Desde el grabber, siempre.
 */
export function useSheetDrag({
  enabled,
  onDismiss,
}: {
  enabled: boolean
  onDismiss: () => void
}) {
  // El nodo se toma del evento: los handlers viven en el popup, así que no
  // hace falta un ref y evitamos pelear con el ref interno de Base UI.
  const nodeRef = useRef<HTMLElement | null>(null)
  const startY = useRef(0)
  const startT = useRef(0)
  const offset = useRef(0)
  const dragging = useRef(false)

  const setOffset = useCallback((value: number) => {
    offset.current = value
    const node = nodeRef.current
    if (!node) return
    node.style.setProperty('--sheet-y', `${value}px`)
    const height = node.offsetHeight || 1
    // El backdrop se aclara a la par del arrastre
    node.style.setProperty(
      '--sheet-progress',
      String(Math.max(0, 1 - value / height)),
    )
  }, [])

  const reset = useCallback(() => {
    nodeRef.current?.removeAttribute('data-dragging')
    setOffset(0)
  }, [setOffset])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType === 'mouse') return

      const target = event.target as HTMLElement
      const fromHandle = Boolean(target.closest('[data-sheet-handle]'))
      if (!fromHandle) {
        // Solo si el contenido está arriba del todo; si no, el gesto es scroll
        const scroller = target.closest('[data-slot="sheet-content"]')
        if (scroller && scroller.scrollTop > 0) return
      }

      nodeRef.current = event.currentTarget
      startY.current = event.clientY
      startT.current = event.timeStamp
      dragging.current = true
    },
    [enabled],
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragging.current) return
      const dy = event.clientY - startY.current
      if (dy <= 0) {
        // Arriba no crece: solo un poco de goma
        setOffset(dy * RESISTANCE)
        return
      }
      if (offset.current === 0 && dy < 4) return
      nodeRef.current?.setAttribute('data-dragging', 'true')
      event.currentTarget.setPointerCapture(event.pointerId)
      setOffset(dy)
    },
    [setOffset],
  )

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragging.current) return
      dragging.current = false

      const dy = event.clientY - startY.current
      const dt = Math.max(event.timeStamp - startT.current, 1)
      const velocity = dy / dt
      const height = nodeRef.current?.offsetHeight ?? 0

      if (velocity > FLICK_V || (height > 0 && dy > height * DISMISS_RATIO)) {
        reset()
        onDismiss()
        return
      }
      reset()
    },
    [onDismiss, reset],
  )

  return {
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  }
}
