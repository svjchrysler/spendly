import { NavLink, Outlet } from 'react-router-dom'
import { ChartColumn, LayoutDashboard, Moon, Receipt, Sun, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/layout/BrandMark'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { PageEnter } from '@/components/layout/PageEnter'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { useTheme } from '@/contexts/ThemeContext'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'

const navItems = [
  {
    to: '/',
    label: 'Resumen',
    end: true,
    icon: LayoutDashboard,
    prefetch: () => import('@/pages/DashboardPage'),
  },
  {
    to: '/analisis',
    label: 'Análisis',
    end: false,
    icon: ChartColumn,
    prefetch: () => import('@/pages/AnalisisPage'),
  },
  {
    to: '/gastos',
    label: 'Gastos',
    end: false,
    icon: Receipt,
    prefetch: () => import('@/pages/ExpensesPage'),
  },
  {
    to: '/categorias',
    label: 'Categorías',
    end: false,
    icon: Tags,
    prefetch: () => import('@/pages/CategoriesPage'),
  },
] as const

export function AppShell() {
  useRealtimeExpenses()
  useKeyboardInset()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 pt-[env(safe-area-inset-top)] backdrop-blur-2xl supports-backdrop-filter:bg-background/65">
        <div className="mx-auto flex h-[var(--app-header-h)] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark />
            <span className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">
              Spendly
            </span>
          </div>

          <nav
            className="hidden h-full flex-1 items-stretch justify-center gap-1 md:flex"
            aria-label="Principal"
          >
            {navItems.map(({ to, label, end, prefetch }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onPointerEnter={() => void prefetch()}
                onFocus={() => void prefetch()}
                className={({ isActive }) =>
                  cn(
                    'pressable relative inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-medium transition-colors duration-200',
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
                        'absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-primary transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="pressable inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <OfflineBanner />

      {/* Ancho completo: el contenido aprovecha el viewport (PWA / desktop). */}
      <main className="mx-auto w-full px-4 pb-[calc(var(--app-tabbar-h)+2.75rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-5 md:pb-10 lg:px-8 xl:px-10 2xl:px-12">
        <PageEnter>
          <Outlet />
        </PageEnter>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-2xl supports-backdrop-filter:bg-background/70 md:hidden"
        aria-label="Principal"
      >
        <div className="pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex h-[var(--app-tabbar-h)] max-w-lg items-stretch justify-around px-1">
            {navItems.map(({ to, label, end, icon: Icon, prefetch }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onPointerEnter={() => void prefetch()}
                onFocus={() => void prefetch()}
                className={({ isActive }) =>
                  cn(
                    'pressable flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium tracking-wide',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        isActive && 'bg-primary/15',
                      )}
                    >
                      <Icon
                        className="size-[1.2rem]"
                        strokeWidth={isActive ? 2.4 : 1.75}
                        aria-hidden
                      />
                    </span>
                    <span className={cn('leading-none', isActive && 'text-primary')}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
