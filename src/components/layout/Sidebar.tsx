import { NavLink } from 'react-router-dom'
import { BrandMark } from '@/components/layout/BrandMark'
import type { TabBarProps } from '@/components/layout/TabBar'
import { isPlainClick } from '@/hooks/useRouteTransition'

/**
 * Sidebar de iOS 27 para ancho regular (iPhone Duo abierto, iPhone en
 * landscape, iPad, desktop): el tab bar se vuelve sidebar, de borde a borde.
 * En el Duo abierto sobra ancho y falta alto — tabs en el header le robaban
 * alto al contenido. Solo el ítem activo lleva el icono en color.
 */
export function Sidebar({ items, onWarm, onSelect }: TabBarProps) {
  return (
    <aside className="app-sidebar hidden md:flex">
      <div className="flex h-[var(--app-header-h)] shrink-0 items-center gap-2.5 px-3">
        <BrandMark />
        <span className="font-display truncate text-[15px] font-semibold tracking-tight">
          Spendly
        </span>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Principal">
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
                if (!isPlainClick(event)) return
                event.preventDefault()
                onSelect(item, index)
              }}
              className="sidebar-item pressable"
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} className="sidebar-icon" />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
