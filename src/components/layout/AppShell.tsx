import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'

const navItems = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/gastos', label: 'Gastos' },
  { to: '/categorias', label: 'Categorías' },
]

export function AppShell() {
  useRealtimeExpenses()

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
              Spendly
            </span>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'cursor-pointer px-4 py-4 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'border-b-2 border-primary text-foreground'
                      : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground',
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

      <main className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8 md:pb-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[3.25rem] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 px-2 py-2.5 text-[10px] font-medium uppercase tracking-wide transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
