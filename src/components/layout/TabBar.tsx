import type { CSSProperties } from 'react'
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
}>

/**
 * Tab bar "Liquid Glass" (iOS 26): cápsula flotante sobre el safe area, con
 * material translúcido, píldora activa que desliza entre tabs y colapso al
 * scrollear. Solo mobile — en desktop manda el nav del header.
 */
export function TabBar({ items, onWarm }: TabBarProps) {
  const { pathname } = useLocation()
  const collapsed = useTabBarCollapse()

  // La píldora se posiciona por índice; NavLink sigue mandando en el color.
  const activeIndex = items.findIndex((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )

  return (
    <div className="tab-dock md:hidden" data-collapsed={collapsed}>
      <nav
        className="tab-glass"
        aria-label="Principal"
        style={{ '--tab-count': items.length } as CSSProperties}
      >
        <div className="tab-track">
          <span
            className="tab-pill"
            aria-hidden
            style={
              {
                '--tab-index': Math.max(activeIndex, 0),
                opacity: activeIndex < 0 ? 0 : 1,
              } as CSSProperties
            }
          />

          {items.map(({ to, label, end, icon: Icon, prefetch }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              viewTransition
              onPointerEnter={() => onWarm(prefetch)}
              onFocus={() => onWarm(prefetch)}
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
          ))}
        </div>
      </nav>
    </div>
  )
}
