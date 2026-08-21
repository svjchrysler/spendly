import { useEffect } from 'react'
import { popModal, pushModal } from '@/lib/modal-depth'

/**
 * Mientras este componente esté montado, la pantalla de atrás retrocede en Z.
 * Lo llaman los `*Content` de sheet/dialog/alert-dialog, que solo existen
 * cuando el modal está abierto.
 */
export function useModalDepth() {
  useEffect(() => {
    pushModal()
    return popModal
  }, [])
}
