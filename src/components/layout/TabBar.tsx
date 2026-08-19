import { useEffect, useRef, type CSSProperties } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { TabIcon } from '@/components/layout/TabIcons'
import { useTabBarCollapse } from '@/hooks/useTabBarCollapse'

export type TabItem = Readonly<{
  to: string
  label: string
  end: boolean
  icon: TabIcon
  prefetch: () => Promise<unknown>
}>

type TabBarProps = Readonly<{
  items: readonly TabItem[]
  onWarm: (prefetch: () => Promise<unknown>) => void
  /** Navega con la transición direccional — ver `useRouteTransition` */
  onSelect: (item: TabItem, index: number) => void
}>

/** Igual que la animación `pill-travel` de index.css */
const PILL_TRAVEL_MS = 520
/** Más allá de tres slots el estirón ya no se distingue */
const MAX_TRAVEL = 3

/**
 * Tab bar "Liquid Glass" (iOS 26): cápsula flotante sobre el safe area, con
 * material translúcido, píldora activa que desliza entre tabs y colapso al
 * scrollear. Solo mobile — en desktop manda el nav del header.
 */
export function TabBar({ items, onWarm, onSelect }: TabBarProps) {
  const { pathname } = useLocation()
  const collapsed = useTabBarCollapse()
  const pillRef = useRef<HTMLSpanElement>(null)
  const lastIndex = useRef(-1)

  // La píldora se posiciona por índice; NavLink sigue mandando en el color.
  const activeIndex = items.findIndex((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )

  /*
    El estirón se aplica sobre el nodo, no por estado: es un efecto de una sola
    pasada por cambio de tab y el render de React no tiene por qué enterarse.
    Tampoco puede ir con `key`, que remontaría la píldora y se llevaría puesta
    la transición de posición.
  */
  useEffect(() => {
    const node = pillRef.current
    const previous = lastIndex.current
    lastIndex.current = activeIndex
    if (!node || activeIndex < 0 || previous < 0 || previous === activeIndex) return

    const travel = Math.min(Math.abs(activeIndex - previous), MAX_TRAVEL)
    node.style.setProperty('--tab-travel', String(travel))
    // Sacar y reponer el atributo reinicia la animación aunque venga de otro
    // salto todavía en curso; el reflow forzado es lo que la hace efectiva.
    node.removeAttribute('data-moving')
    void node.offsetWidth
    node.setAttribute('data-moving', 'true')

    const timer = setTimeout(() => node.removeAttribute('data-moving'), PILL_TRAVEL_MS)
    return () => clearTimeout(timer)
  }, [activeIndex])

  return (
    <div className="tab-dock md:hidden" data-collapsed={collapsed}>
      <nav
        className="material-glass tab-glass"
        aria-label="Principal"
        style={{ '--tab-count': items.length } as CSSProperties}
      >
        <div className="tab-track">
          <span
            ref={pillRef}
            className="tab-pill"
            aria-hidden
            style={
              {
                '--tab-index': Math.max(activeIndex, 0),
                opacity: activeIndex < 0 ? 0 : 1,
              } as CSSProperties
            }
          />

          {items.map((item, index) => {
            const { to, label, end, icon: Icon, prefetch } = item
            return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onPointerEnter={() => onWarm(prefetch)}
              onFocus={() => onWarm(prefetch)}
              onClick={(event) => {
                // Modificadores y botones raros son "abrir aparte": el
                // navegador sabe mejor que nosotros qué hacer con eso.
                if (
                  event.defaultPrevented ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                ) {
                  return
                }
                event.preventDefault()
                onSelect(item, index)
              }}
              className="tab-item"
            >
              {({ isActive }) => (
                <>
                  {/* key: remonta el wrap para que el bounce del símbolo
                      vuelva a dispararse en cada selección */}
                  <span key={isActive ? 'on' : 'off'} className="tab-icon-wrap">
                    <Icon active={isActive} className="tab-icon" />
                  </span>
                  <span className="tab-label">{label}</span>
                </>
              )}
            </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
