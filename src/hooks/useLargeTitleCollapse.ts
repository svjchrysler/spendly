import { useEffect, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { subscribeScroll } from '@/lib/scroll-store'

/**
 * Colapso del large title, como la nav bar de iOS.
 *
 * El valor tiene que ser continuo (0→1) y actualizarse por frame. Meterlo en
 * `useState` re-renderizaría todo el árbol de la página a 60fps, así que se
 * escribe directo como custom property en `<html>` y el CSS hace el resto.
 *
 * Se emite además `data-nav-collapsed` en el mismo suscriptor: es el fallback
 * para motores sin `@property`, donde el `calc()` sobre un número sin unidad
 * no resuelve y hay que caer a un crossfade binario.
 */
export function useLargeTitleCollapse(ref: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation()

  useEffect(() => {
    const root = document.documentElement
    let height = 0
    let progress = -1

    const apply = (y: number) => {
      const next = height > 0 ? Math.min(Math.max(y / height, 0), 1) : 0
      // Evita escribir la misma property en cada frame de un scroll quieto
      if (Math.abs(next - progress) < 0.005 && next !== 0 && next !== 1) return
      progress = next
      root.style.setProperty('--nav-progress', String(next))
      root.dataset.navCollapsed = next > 0.5 ? 'true' : 'false'
    }

    const measure = () => {
      // El título se considera colapsado cuando se scrolleó su propio alto
      height = ref.current?.offsetHeight ?? 0
      apply(window.scrollY)
    }

    measure()

    const observer = new ResizeObserver(measure)
    if (ref.current) observer.observe(ref.current)

    const unsubscribe = subscribeScroll(({ y }) => apply(y))

    return () => {
      observer.disconnect()
      unsubscribe()
      root.style.removeProperty('--nav-progress')
      delete root.dataset.navCollapsed
    }
  }, [ref, pathname])
}
