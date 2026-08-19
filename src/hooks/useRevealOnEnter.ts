import { useEffect, useRef } from 'react'

/** Clases de entrada de `index.css` que este hook puede diferir. */
type RevealClass = 'reveal' | 'stagger'

/**
 * Difiere una animación de entrada hasta que el bloque se ve.
 *
 * `.reveal` y `.stagger` corren al montar: en una página larga las de abajo
 * gastan su entrada fuera de pantalla y el usuario llega a algo ya quieto.
 * Acá la clase se agrega recién cuando el bloque cruza el viewport, así que
 * la animación vuelve a contestar "esto acaba de llegar".
 *
 * Es aditivo por diseño: el contenido se pinta visible y la clase solo suma
 * el keyframe. Sin `IntersectionObserver` (o sin JS) no pasa nada malo, solo
 * no hay animación.
 *
 * No usa `scroll-store`: un observer no mide en cada frame de scroll, el
 * browser lo resuelve solo y se desconecta al primer cruce.
 */
export function useRevealOnEnter<T extends HTMLElement>(className: RevealClass = 'reveal') {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || node.classList.contains(className)) return

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add(className)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add(className)
          observer.disconnect()
        }
      },
      // Un pelo adentro: el bloque entra cuando se lee, no cuando asoma
      { rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [className])

  return ref
}
