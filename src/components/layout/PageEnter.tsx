import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { navUsedViewTransition } from '@/hooks/useRouteTransition'

/*
  ponytail: opacity only — animar transform acá convierte al wrapper en
  containing block y el FAB portaleado deja de ser fixed.
*/
function PageFrame({ children }: Readonly<{ children: ReactNode }>) {
  /*
    Se decide una sola vez por montaje. Antes esto miraba si `document` tenía
    `startViewTransition`, y como la transición de ruta en realidad nunca
    corría (ver `useRouteTransition`), en todo browser moderno el fade quedaba
    apagado sin que nada lo reemplazara. Ahora la pregunta es la correcta:
    ¿la navegación que me trajo acá usó una transición de verdad?

    Con `useState` y no leyendo la bandera en cada render: cuando la bandera se
    limpia al terminar la transición, un re-render agregaría la clase a mitad
    de pantalla y el keyframe se dispararía de nuevo.
  */
  const [skipFade] = useState(navUsedViewTransition)
  return <div className={skipFade ? undefined : 'page-enter'}>{children}</div>
}

export function PageEnter({ children }: Readonly<{ children: ReactNode }>) {
  const { pathname } = useLocation()

  // `key`: cada ruta es un montaje nuevo, así el fade vuelve a correr. Cubre
  // también el back/forward, que no pasa por `useRouteTransition`.
  return <PageFrame key={pathname}>{children}</PageFrame>
}
