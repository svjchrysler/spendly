import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Toolbar de iOS: barra de acciones anclada abajo, con material glass.
 *
 * Dentro de un sheet respeta `--keyboard-inset` igual que el sheet mismo, así
 * la acción primaria queda por encima del teclado en vez de tapada.
 */
export function Toolbar({
  placement = 'bottom',
  className,
  children,
}: Readonly<{
  placement?: 'bottom' | 'inline'
  className?: string
  children: ReactNode
}>) {
  return (
    <div
      data-slot="toolbar"
      className={cn(
        'flex items-center gap-2',
        placement === 'bottom' && [
          'material-glass material-glass--bar sticky bottom-0 z-10 -mx-4 mt-auto px-4 py-3',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        ],
        className,
      )}
    >
      {children}
    </div>
  )
}
