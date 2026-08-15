import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/layout/BrandMark'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { PageEnter } from '@/components/layout/PageEnter'
import { NavTitleProvider, useNavTitle } from '@/components/layout/NavBar'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { PullToRefresh } from '@/components/layout/PullToRefresh'
import { TabBar, type TabItem } from '@/components/layout/TabBar'
import { ChartIcon, HouseIcon, ReceiptIcon, TagIcon } from '@/components/layout/TabIcons'
import { useMonth } from '@/contexts/MonthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { prefetchMonthData } from '@/lib/prefetch-month'

const navItems: readonly TabItem[] = [
  {
    to: '/',
    label: 'Resumen',
    end: true,
    icon: HouseIcon,
    prefetch: () => import('@/pages/DashboardPage'),
  },
  {
    to: '/analisis',
    label: 'Análisis',
    end: false,
    icon: ChartIcon,
    prefetch: () => import('@/pages/AnalisisPage'),
  },
  {
    to: '/gastos',
    label: 'Gastos',
    end: false,
    icon: ReceiptIcon,
    prefetch: () => import('@/pages/ExpensesPage'),
  },
  {
    to: '/categorias',
    label: 'Categorías',
    end: false,
    icon: TagIcon,
    prefetch: () => import('@/pages/CategoriesPage'),
  },
]

export function AppShell() {
  return (
    <NavTitleProvider>
      <AppShellInner />
    </NavTitleProvider>
  )
}

function AppShellInner() {
  useRealtimeExpenses()
  useKeyboardInset()
  useScrollRestoration()
  const { theme, toggleTheme } = useTheme()
  const { year, month } = useMonth()
  const queryClient = useQueryClient()
  const navTitle = useNavTitle()

  function warmRoute(prefetch: () => Promise<unknown>) {
    void prefetch()
    prefetchMonthData(queryClient, year, month)
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      {/* Sin material en reposo: con la status bar en estilo `default` iOS pinta
          esa franja con theme-color y una barra tintada dejaría una costura. */}
      <header
        className="nav-bar material-glass--bar sticky top-0 z-50 pt-[env(safe-area-inset-top)]"
        data-materialized="true"
      >
        <div className="relative mx-auto flex h-[var(--app-header-h)] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="nav-brand flex min-w-0 items-center gap-2.5">
            <BrandMark />
            <span className="font-display truncate text-sm font-semibold tracking-tight sm:text-[15px]">
              Spendly
            </span>
          </div>

          {/* Título inline: entra cuando el large title de la página se va */}
          {navTitle ? (
            <div className="nav-inline-title pointer-events-none absolute inset-x-0 flex justify-center px-20 md:hidden">
              <span className="truncate text-headline capitalize text-label">
                {navTitle.title}
              </span>
            </div>
          ) : null}

          <nav
            className="hidden h-full flex-1 items-stretch justify-center gap-1 md:flex"
            aria-label="Principal"
          >
            {navItems.map(({ to, label, end, prefetch }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                viewTransition
                onPointerEnter={() => warmRoute(prefetch)}
                onFocus={() => warmRoute(prefetch)}
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
              className="pressable inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <OfflineBanner />
      <PullToRefresh />

      {/* Ancho completo: el contenido aprovecha el viewport (PWA / desktop). */}
      <main className="mx-auto w-full px-4 pb-[calc(var(--app-tabbar-space)+2rem)] pt-4 sm:px-6 sm:pt-5 md:pb-10 lg:px-8 xl:px-10 2xl:px-12">
        <PageEnter>
          <Outlet />
        </PageEnter>
      </main>

      <TabBar items={navItems} onWarm={warmRoute} />
    </div>
  )
}
