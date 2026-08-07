import { useEffect } from 'react'

/**
 * Lifts fixed bottom UI above the soft keyboard via --keyboard-inset.
 * iOS ignores interactive-widget; visualViewport is the reliable signal.
 */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    let lastInset = -1

    const sync = () => {
      const inset = Math.max(
        0,
        Math.round(window.innerHeight - vv.height - vv.offsetTop),
      )
      // iOS emite `scroll` durante el gesto: sin este guard reescribimos la var
      // y reposicionamos en cada frame, matando el scroll horizontal en curso
      if (inset === lastInset) return
      const justOpened = lastInset <= 0 && inset > 0
      lastInset = inset

      document.documentElement.style.setProperty('--keyboard-inset', `${inset}px`)

      // Keep focused field visible inside scrollable sheets after the lift
      if (!justOpened) return
      const active = document.activeElement
      if (
        active instanceof HTMLElement &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        active.closest('[data-slot="sheet-content"]')
      ) {
        requestAnimationFrame(() => {
          active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        })
      }
    }

    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      document.documentElement.style.removeProperty('--keyboard-inset')
    }
  }, [])
}
