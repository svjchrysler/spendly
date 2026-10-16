/**
 * Atajos de teclado globales. Qué tecla dispara qué es una decisión pura
 * (tecla + contexto del foco → acción), así se testea sin DOM; el contexto lo
 * arma `useKeyboardShortcuts`.
 */

export type ShortcutAction = 'add' | 'search' | 'prev-month' | 'next-month'

export type ShortcutKey = Readonly<{
  key: string
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
  /** No se filtra: en un teclado en español "/" es Shift+7 */
  shiftKey?: boolean
  repeat: boolean
  isComposing?: boolean
}>

export type ShortcutContext = Readonly<{
  /** El foco está en algo donde se escribe */
  editable: boolean
  /** El foco está en un control que ya usa las flechas (segmented, tabs, chart) */
  ownsArrows: boolean
  /** Hay un sheet o un diálogo abierto: sus teclas son suyas */
  modalOpen: boolean
}>

/** Lo que muestran los tooltips y el `kbd` del sidebar */
export const SHORTCUT_KEYS: Readonly<Record<ShortcutAction, string>> = {
  add: 'N',
  search: '/',
  'prev-month': '←',
  'next-month': '→',
}

export function matchShortcut(
  event: ShortcutKey,
  context: ShortcutContext,
): ShortcutAction | null {
  // ⌘/Ctrl/Alt son del navegador o del sistema: ⌘← es "atrás" en Mac
  if (event.metaKey || event.ctrlKey || event.altKey) return null
  // Una tecla apretada no abre diez altas ni salta diez meses
  if (event.repeat || event.isComposing) return null
  if (context.editable || context.modalOpen) return null

  switch (event.key) {
    case 'n':
    case 'N':
      return 'add'
    case '/':
      return 'search'
    case 'ArrowLeft':
      return context.ownsArrows ? null : 'prev-month'
    case 'ArrowRight':
      return context.ownsArrows ? null : 'next-month'
    default:
      return null
  }
}
