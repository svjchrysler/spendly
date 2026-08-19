import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

/** Hacia dónde va la navegación en el orden de los tabs. */
export type NavDirection = 'next' | 'prev'

type StartViewTransition = (callback: () => void) => { finished: Promise<unknown> }

/** `--dur-2` + margen: cubre la transición entera. */
const NAV_SETTLE_MS = 400

let usedTransition = false
let navUntil = 0

/**
 * ¿La última navegación la pintó el browser? `PageEnter` lo consulta para no
 * sumar su propio fade encima de la transición.
 */
export function navUsedViewTransition() {
  return usedTransition
}

/**
 * ¿Estamos dentro de una transición de ruta? Lo consulta `AnimatedAmount`: si
 * el monto viene morfeando de la pantalla anterior (`view-transition-name`),
 * contarlo además desde cero serían dos animaciones sobre el mismo número.
 */
export function isNavigating() {
  return performance.now() < navUntil
}

/**
 * Navegación entre tabs con View Transitions.
 *
 * El prop `viewTransition` de `NavLink` **solo funciona con el data router**
 * (`RouterProvider`): con `<BrowserRouter>` el flag llega a `useNavigate`, que
 * se lo pasa a `navigator.push` como tercer argumento, y el history lo tira.
 * `Link` además calcula `isTransitioning` contra `DataRouterStateContext`, que
 * acá es `null`. O sea que la app venía sin transición de ruta — y `PageEnter`
 * encima apagaba su propio fallback al ver la API en `document`.
 *
 * Así que la disparamos nosotros, con el mismo patrón que `ThemeContext`.
 *
 * El módulo de la página se espera **antes** de arrancar: las rutas son lazy
 * bajo un único `<Suspense>` que envuelve al shell entero, así que sin esto el
 * snapshot "nuevo" sería el skeleton y la transición fotografiaría una app
 * vacía.
 */
export function useRouteTransition() {
  const navigate = useNavigate()

  return useCallback(
    async (to: string, direction: NavDirection, load?: () => Promise<unknown>) => {
      const doc = document as Document & {
        startViewTransition?: StartViewTransition
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      navUntil = performance.now() + NAV_SETTLE_MS

      if (reduced || typeof doc.startViewTransition !== 'function') {
        usedTransition = false
        navigate(to)
        return
      }

      // ponytail: si el chunk falla seguimos igual — el Suspense lo reintenta
      if (load) await load().catch(() => undefined)

      const root = document.documentElement
      root.dataset.vtDir = direction
      usedTransition = true

      const transition = doc.startViewTransition(() => {
        flushSync(() => navigate(to))
      })

      void Promise.resolve(transition.finished)
        .catch(() => undefined)
        .finally(() => {
          delete root.dataset.vtDir
          usedTransition = false
        })
    },
    [navigate],
  )
}
