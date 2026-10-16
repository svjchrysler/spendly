import { useEffect, useRef } from 'react'
import { matchShortcut, type ShortcutAction } from '@/lib/keyboard-shortcuts'

/**
 * Controles que ya usan las flechas: no se las sacamos. Los charts entran por
 * `application`, el rol que recharts le pone a su superficie enfocable.
 */
const ARROW_OWNERS = [
  '[role="radiogroup"]',
  '[role="tablist"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="slider"]',
  '[role="grid"]',
  '[role="tree"]',
  '[role="application"]',
].join(', ')

/**
 * Un sheet o diálogo montado. Base UI los desmonta al cerrar, así que estar
 * en el DOM es estar abierto (o saliendo).
 */
const OPEN_MODAL = '[role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]'

function isEditable(target: Element | null) {
  if (!target) return false
  if (target instanceof HTMLElement && target.isContentEditable) return true
  return target.closest('input, textarea, select') !== null
}

/**
 * Atajos globales de la app (ver `lib/keyboard-shortcuts.ts`). Un solo
 * listener en `window`; los handlers se leen al momento de la tecla, así
 * pueden cambiar en cada render sin volver a registrarlo.
 */
export function useKeyboardShortcuts(handlers: Readonly<Record<ShortcutAction, () => void>>) {
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return
      const target = event.target instanceof Element ? event.target : null
      const action = matchShortcut(event, {
        editable: isEditable(target),
        ownsArrows: target?.closest(ARROW_OWNERS) != null,
        modalOpen: document.querySelector(OPEN_MODAL) != null,
      })
      if (!action) return
      event.preventDefault()
      handlersRef.current[action]()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
