import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Receipt, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageEnter } from '@/components/layout/PageEnter'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'

const navItems = [
  { to: '/', label: 'Resumen', end: true, icon: LayoutDashboard },
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/categorias', label: 'Categorías', icon: Tags },
]

export function AppShell() {
  useRealtimeExpenses()

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
            Spendly
          </span>

          <nav className="hidden h-full flex-1 items-stretch justify-center gap-1 md:flex">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'pressable inline-flex cursor-pointer items-center border-b-2 px-4 text-sm font-medium',
                    isActive
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-6 md:pb-10">
        <PageEnter>
          <Outlet />
        </PageEnter>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
          {navItems.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'pressable flex min-h-[3.5rem] flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium tracking-wide',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="size-[1.15rem]"
                    strokeWidth={isActive ? 2.25 : 1.75}
                    aria-hidden
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
