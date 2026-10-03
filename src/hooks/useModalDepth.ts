import { useEffect, useState } from 'react'
import { popModal, pushModal } from '@/lib/modal-depth'

/**
 * Mientras `open` sea true, la pantalla de atrás retrocede en Z.
 *
 * Va en los `Root` de sheet/dialog/alert-dialog, no en los `*Content`: Base UI
 * renderiza los hijos de `Root` también con el modal cerrado, así que colgar el
 * efecto del montaje lo dejaría empujado para siempre. Al cerrar tampoco sirve montarse
 * dentro del `Portal`: sigue montado hasta que termina la animación de salida,
 * y la pantalla tiene que volver junto con ella, no después.
 */
export function useModalDepth(open: boolean) {
  useEffect(() => {
    if (!open) return
    pushModal()
    return popModal
  }, [open])
}

/**
 * `useModalDepth` para un `Root` de Base UI, que puede venir controlado o no.
 * Devuelve el `onOpenChange` a pasarle: espeja el estado para el caso sin
 * controlar y sigue llamando al handler de quien lo usa.
 */
export function useModalDepthRoot<Details>(
  open: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean, details: Details) => void) | undefined,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false)
  useModalDepth(open ?? uncontrolled)

  return (next: boolean, details: Details) => {
    setUncontrolled(next)
    onOpenChange?.(next, details)
  }
}
