import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageEnter({ children }: Readonly<{ children: ReactNode }>) {
  const { pathname } = useLocation()
  const supportsViewTransition =
    typeof document !== 'undefined' && 'startViewTransition' in document

  // Con View Transitions (NavLink viewTransition) el fade lo hace el browser.
  // Sin soporte: keyframe CSS de opacity — Framer costaba ~40 kB gz en el
  // arranque para esto, y `transform` rompería el position:fixed del FAB.
  // El fallback de prefers-reduced-motion lo cubre la regla global de index.css.
  return (
    <div key={pathname} className={supportsViewTransition ? undefined : 'page-enter'}>
      {children}
    </div>
  )
}
