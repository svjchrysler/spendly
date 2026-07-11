import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Receipt, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/layout/BrandMark'
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
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark />
            <span className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">
              Spendly
            </span>
          </div>

          <nav className="hidden h-full flex-1 items-stretch justify-center gap-0.5 md:flex">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'pressable relative inline-flex cursor-pointer items-center px-4 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground/80',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      className={cn(
                        'absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-7 md:pb-12">
        <PageEnter>
          <Outlet />
        </PageEnter>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
          {navItems.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'pressable flex min-h-[3.6rem] flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium tracking-wide',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      isActive && 'bg-primary/12',
                    )}
                  >
                    <Icon
                      className="size-[1.15rem]"
                      strokeWidth={isActive ? 2.35 : 1.75}
                      aria-hidden
                    />
                  </span>
                  <span className={cn('transition-colors', isActive && 'text-primary')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
