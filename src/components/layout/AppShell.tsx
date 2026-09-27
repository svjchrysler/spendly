import { lazy, Suspense, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { BrandMark } from '@/components/layout/BrandMark'
import { HomeIconNotice } from '@/components/layout/HomeIconNotice'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { PageEnter } from '@/components/layout/PageEnter'
import { NavTitleProvider, useNavTitle } from '@/components/layout/NavBar'
import { PullToRefresh } from '@/components/layout/PullToRefresh'
import { Sidebar } from '@/components/layout/Sidebar'
import { TabBar, type TabItem } from '@/components/layout/TabBar'
import { ChartIcon, HouseIcon, ReceiptIcon, TagIcon } from '@/components/layout/TabIcons'
import { useAuth } from '@/contexts/AuthContext'
import { useMonth } from '@/contexts/MonthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'
import { useRouteTransition } from '@/hooks/useRouteTransition'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { tapFeedback } from '@/lib/haptics'
import { prefetchMonthData } from '@/lib/prefetch-month'

/*
  El menú de perfil es lo único del shell que usa el Menu de base-ui (y con él
  floating-ui): estático, pesaba en el chunk de entrada de todas las pantallas.
  Se precarga en idle; hasta entonces se ve el mismo avatar.
*/
const importProfileMenu = () => import('@/components/layout/ProfileMenu')
const ProfileMenu = lazy(() =>
  importProfileMenu().then((module) => ({ default: module.ProfileMenu })),
)

function ProfileMenuPlaceholder() {
  const { user } = useAuth()
  return (
    <span className="inline-flex size-11 items-center justify-center" aria-hidden>
      <span className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-xs font-medium text-foreground">
        {user?.email?.charAt(0).toUpperCase() ?? 'S'}
      </span>
    </span>
  )
}

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

/** Índice del tab que corresponde a un path — el orden manda la dirección. */
function tabIndexOf(pathname: string) {
  return navItems.findIndex((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
}

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
  const { pathname } = useLocation()
  const navigateToRoute = useRouteTransition()
  const activeIndex = tabIndexOf(pathname)

  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') {
      const timer = window.setTimeout(() => void importProfileMenu(), 1500)
      return () => window.clearTimeout(timer)
    }
    const handle = window.requestIdleCallback(() => void importProfileMenu(), {
      timeout: 3000,
    })
    return () => window.cancelIdleCallback(handle)
  }, [])

  /*
    La dirección sale del orden de los tabs, no del path: es el mismo
    vocabulario que `.swap` usa para los meses, un escalón más arriba. El
    `prefetch` de la ruta se pasa como `load` — la transición no puede
    arrancar antes de que el chunk esté, o fotografía el skeleton.
  */
  const goToTab = useCallback(
    (item: TabItem, index: number) => {
      if (index === activeIndex) return
      tapFeedback()
      void navigateToRoute(item.to, index > activeIndex ? 'next' : 'prev', item.prefetch)
    },
    [activeIndex, navigateToRoute],
  )

  function warmRoute(prefetch: () => Promise<unknown>) {
    void prefetch()
    prefetchMonthData(queryClient, year, month)
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-background md:grid md:grid-cols-[var(--app-sidebar-w)_minmax(0,1fr)]">
      <Sidebar items={navItems} onWarm={warmRoute} onSelect={goToTab} />

      {/* El sidebar absorbe el safe area izquierdo en landscape; la columna,
          el derecho */}
      <div className="min-w-0 md:pr-[env(safe-area-inset-right)]">
        {/* Sin material en reposo: con la status bar en estilo `default` iOS pinta
            esa franja con theme-color y una barra tintada dejaría una costura. */}
        <header
          className="nav-bar material-glass--bar sticky top-0 z-50 pt-[env(safe-area-inset-top)]"
          data-materialized="true"
        >
          <div className="relative mx-auto flex h-[var(--app-header-h)] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            {/* En regular la marca vive en el sidebar */}
            <div className="nav-brand flex min-w-0 items-center gap-2.5 md:invisible">
              <BrandMark />
              <span className="font-display truncate text-sm font-semibold tracking-tight sm:text-[15px]">
                Spendly
              </span>
            </div>

            {/* Título inline: entra cuando el large title de la página se va */}
            {navTitle ? (
              <div className="nav-inline-title pointer-events-none absolute inset-x-0 flex justify-center px-20">
                <span className="truncate text-headline capitalize text-label">
                  {navTitle.title}
                </span>
              </div>
            ) : null}

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="pressable inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {/* El ícono gira al entrar: el toggle se lee como un cambio de
                    estado y no como dos botones distintos */}
                {theme === 'dark' ? (
                  <Sun className="icon-swap size-4" />
                ) : (
                  <Moon className="icon-swap size-4" />
                )}
              </button>
              <Suspense fallback={<ProfileMenuPlaceholder />}>
                <ProfileMenu />
              </Suspense>
            </div>
          </div>
        </header>

        <OfflineBanner />
        <HomeIconNotice />
        <PullToRefresh />

        {/*
          Ancho completo. Container: los grids de página responden al ancho que
          de verdad tiene el contenido (sidebar, Split View), no al viewport.
          Ojo: `container-type` implica layout containment — `main` pasa a ser
          containing block de todo `fixed` de adentro. Lo fixed va por portal.
        */}
        <main className="@container/main mx-auto w-full px-4 pb-[calc(var(--app-tabbar-space)+2rem)] pt-4 sm:px-6 sm:pt-5 md:pb-10 lg:px-8 xl:px-10 2xl:px-12">
          <PageEnter>
            <Outlet />
          </PageEnter>
        </main>
      </div>

      <TabBar items={navItems} onWarm={warmRoute} onSelect={goToTab} />
    </div>
  )
}
