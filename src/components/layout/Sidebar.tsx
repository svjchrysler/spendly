import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/layout/BrandMark'
import type { TabBarProps } from '@/components/layout/TabBar'
import { isPlainClick } from '@/hooks/useRouteTransition'
import { SHORTCUT_KEYS } from '@/lib/keyboard-shortcuts'

type SidebarProps = TabBarProps &
  Readonly<{
    onAdd: () => void
    onWarmAdd: () => void
    onOpenSettings: () => void
    onWarmSettings: () => void
    account: Readonly<{ initial: string; email?: string }>
  }>

/**
 * Sidebar de iOS 27 para ancho regular (iPhone Duo abierto, iPhone en
 * landscape, iPad, desktop): el tab bar se vuelve sidebar, de borde a borde.
 * En el Duo abierto sobra ancho y falta alto — tabs en el header le robaban
 * alto al contenido. Solo el ítem activo lleva el icono en color.
 *
 * En regular es además el centro de mando: la acción principal arriba y la
 * cuenta al pie. Antes vivían como dos círculos sueltos en la esquina de la
 * barra, lejos de todo lo demás.
 */
export function Sidebar({
  items,
  onWarm,
  onSelect,
  onAdd,
  onWarmAdd,
  onOpenSettings,
  onWarmSettings,
  account,
}: SidebarProps) {
  return (
    <aside className="app-sidebar hidden md:flex">
      <div className="flex h-[var(--app-header-h)] shrink-0 items-center gap-2.5 px-3">
        <BrandMark />
        <span className="font-display truncate text-[15px] font-semibold tracking-tight">
          Spendly
        </span>
      </div>

      {/* Relleno y no vidrio: el sidebar ya es la capa de vidrio */}
      <Button
        type="button"
        size="touch"
        className="mb-2 w-full cursor-pointer justify-start rounded-full px-3.5 text-body font-semibold"
        onClick={onAdd}
        onPointerEnter={onWarmAdd}
        onFocus={onWarmAdd}
        title={`Nuevo gasto (${SHORTCUT_KEYS.add})`}
      >
        <Plus className="size-5" strokeWidth={2.5} aria-hidden />
        Nuevo gasto
        <kbd
          className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-[0.3125rem] border border-primary-foreground/25 px-1 font-sans text-caption-1 font-semibold text-primary-foreground/75 pointer-fine:inline-flex"
          aria-hidden
        >
          {SHORTCUT_KEYS.add}
        </kbd>
      </Button>

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

      <button
        type="button"
        className="sidebar-item pressable mt-auto shrink-0 py-2 text-left"
        onClick={onOpenSettings}
        onPointerEnter={onWarmSettings}
        onFocus={onWarmSettings}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fill-tertiary text-subhead font-semibold text-label"
          aria-hidden
        >
          {account.initial}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate">Ajustes</span>
          {account.email ? (
            <span className="truncate text-footnote text-label-secondary">{account.email}</span>
          ) : null}
        </span>
      </button>
    </aside>
  )
}
