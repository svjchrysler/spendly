import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Tarjeta de dos caras.
 *
 * Es el **único** lugar del proyecto con `perspective` en un ancestro y
 * `transform-style: preserve-3d`: en todo el resto el 3D se escribe
 * autocontenido (`transform: perspective(P) …`) justamente para no crear
 * containing blocks. Acá no alcanza — dos caras que comparten espacio
 * necesitan un contexto 3D real.
 *
 * Es seguro porque adentro del hero no hay nada `position: fixed`: el FAB
 * portalea a `document.body`.
 *
 * Las caras se apilan con grid en vez de `position: absolute`, así la altura
 * es la de la cara más alta y no hay que medir nada.
 *
 * `backface-visibility` esconde la cara de atrás de la vista pero **no** del
 * lector de pantalla ni del tab, así que la oculta va con `inert` +
 * `aria-hidden`. El CSS reusa ese mismo `inert` para el fallback de
 * `prefers-reduced-motion`, donde no hay giro y las caras se intercambian.
 */
export function FlipCard({
  flipped,
  front,
  back,
  className,
}: Readonly<{
  flipped: boolean
  front: ReactNode
  back: ReactNode
  className?: string
}>) {
  return (
    <div className={cn('flip-card', className)}>
      <div className="flip-card__inner" data-flipped={flipped || undefined}>
        <div className="flip-card__face" inert={flipped} aria-hidden={flipped}>
          {front}
        </div>
        <div
          className="flip-card__face flip-card__face--back"
          inert={!flipped}
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
