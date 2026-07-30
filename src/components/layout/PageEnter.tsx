import { motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageEnter({ children }: Readonly<{ children: ReactNode }>) {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()
  const supportsViewTransition =
    typeof document !== 'undefined' && 'startViewTransition' in document

  // Con View Transitions (NavLink viewTransition) no hace falta Framer.
  // Sin soporte: fade opacity-only — transform rompe position:fixed del FAB.
  if (supportsViewTransition || reduceMotion) {
    return <div key={pathname}>{children}</div>
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
