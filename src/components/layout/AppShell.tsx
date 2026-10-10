import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddExpenseProvider } from '@/components/expenses/AddExpenseProvider'
import { useAddExpense } from '@/components/expenses/add-expense-context'
import { HomeIconNotice } from '@/components/layout/HomeIconNotice'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { PageEnter } from '@/components/layout/PageEnter'
import { NavTitleProvider, useNavTitle } from '@/components/layout/NavBar'
import { PullToRefresh } from '@/components/layout/PullToRefresh'
import { Sidebar } from '@/components/layout/Sidebar'
import { TabBar, type TabItem } from '@/components/layout/TabBar'
import { ChartIcon, HouseIcon, ReceiptIcon } from '@/components/layout/TabIcons'
import {
  SettingsContext,
  type SettingsEntry,
} from '@/components/settings/settings-context'
import { useAuth } from '@/contexts/AuthContext'
import { useMonth } from '@/contexts/MonthContext'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'
import { useRouteTransition } from '@/hooks/useRouteTransition'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { tapFeedback } from '@/lib/haptics'
import { prefetchMonthData } from '@/lib/prefetch-month'

/*
  Ajustes (categorías, presupuesto, export, sesión) es lo único del shell que
  arrastra forms y el export: fuera del chunk de entrada. Se precarga en idle
  y se monta recién la primera vez que se abre.
*/
const importSettingsSheet = () => import('@/components/settings/SettingsSheet')
const SettingsSheet = lazy(() =>
  importSettingsSheet().then((module) => ({ default: module.SettingsSheet })),
)

const SETTINGS_ENTRIES: readonly SettingsEntry[] = ['root', 'categorias', 'presupuesto']

/*
  Tres destinos y una acción: Categorías dejó de ser un tab — se toca poco y
  vive en Ajustes, como en las apps de Apple. El orden manda la dirección de
  la transición entre pantallas.
*/
const navItems: readonly TabItem[] = [
  {
    to: '/',
    label: 'Resumen',
    end: true,
    icon: HouseIcon,
    prefetch: () => import('@/pages/DashboardPage'),
  },
  {
    to: '/gastos',
    label: 'Gastos',
    end: false,
    icon: ReceiptIcon,
    prefetch: () => import('@/pages/ExpensesPage'),
  },
  {
    to: '/analisis',
    label: 'Análisis',
    end: false,
    icon: ChartIcon,
    prefetch: () => import('@/pages/AnalisisPage'),
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
      <AddExpenseProvider>
        <AppShellInner />
      </AddExpenseProvider>
    </NavTitleProvider>
  )
}

function AppShellInner() {
  useRealtimeExpenses()
  useKeyboardInset()
  useScrollRestoration()
  const { user } = useAuth()
  const { year, month } = useMonth()
  const { openAdd, warmAdd } = useAddExpense()
  const queryClient = useQueryClient()
  const navTitle = useNavTitle()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigateToRoute = useRouteTransition()
  const activeIndex = tabIndexOf(pathname)

  const [settings, setSettings] = useState<{
    open: boolean
    entry: SettingsEntry
    session: number
  }>({ open: false, entry: 'root', session: 0 })
  const [settingsMounted, setSettingsMounted] = useState(false)

  const openSettings = useCallback((entry: SettingsEntry = 'root') => {
    void importSettingsSheet()
    setSettingsMounted(true)
    setSettings((current) => ({ open: true, entry, session: current.session + 1 }))
  }, [])

  const settingsApi = useMemo(() => ({ openSettings }), [openSettings])

  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') {
      const timer = window.setTimeout(() => void importSettingsSheet(), 1500)
      return () => window.clearTimeout(timer)
    }
    const handle = window.requestIdleCallback(() => void importSettingsSheet(), {
      timeout: 3000,
    })
    return () => window.cancelIdleCallback(handle)
  }, [])

  // `/categorias` (el tab de antes) y los atajos llegan como `?ajustes=`
  useEffect(() => {
    const requested = searchParams.get('ajustes')
    if (requested == null) return
    const entry = SETTINGS_ENTRIES.find((item) => item === requested) ?? 'root'
    openSettings(entry)
    const next = new URLSearchParams(searchParams)
    next.delete('ajustes')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, openSettings])

  /*
    La dirección sale del orden de los tabs, no del path: es el mismo
    vocabulario que `.swap` usa para los meses, un escalón más arriba. El
    `prefetch` de la ruta se pasa como `load` — la transición no puede
    arrancar antes de que el chunk esté, o fotografía el skeleton.
  */
  const goToTab = useCallback(
    (item: TabItem, index: number) => {
      // Tocar el tab en el que ya estás sube al inicio, como en iOS
      if (index === activeIndex) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      tapFeedback()
      void navigateToRoute(item.to, index > activeIndex ? 'next' : 'prev', item.prefetch)
    },
    [activeIndex, navigateToRoute],
  )

  function warmRoute(prefetch: () => Promise<unknown>) {
    void prefetch()
    prefetchMonthData(queryClient, year, month)
  }

  function handleAdd() {
    tapFeedback()
    openAdd()
  }

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'S'

  return (
    <SettingsContext.Provider value={settingsApi}>
      <div className="min-h-dvh overflow-x-clip bg-background md:grid md:grid-cols-[var(--app-sidebar-w)_minmax(0,1fr)]">
        <Sidebar items={navItems} onWarm={warmRoute} onSelect={goToTab} />

        {/* El sidebar absorbe el safe area izquierdo en landscape; la columna,
            el derecho */}
        <div className="min-w-0 md:pr-[env(safe-area-inset-right)]">
          {/* Sin barra: los controles flotan como vidrio y el contenido se
              esfuma por debajo al scrollear (ver `.nav-bar` en index.css) */}
          <header className="nav-bar sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
            <div className="relative mx-auto flex h-[var(--app-header-h)] w-full items-center justify-end gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
              {/* Título inline: entra cuando el large title de la página se va */}
              {navTitle ? (
                <div className="nav-inline-title pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center px-24 leading-tight">
                  <span className="max-w-full truncate text-headline text-label">
                    {navTitle.title}
                  </span>
                  {navTitle.subtitle ? (
                    <span className="max-w-full truncate text-caption-1 text-label-secondary first-letter:uppercase">
                      {navTitle.subtitle}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* En compact el + vive junto al tab bar; en regular, en la barra */}
              <Button
                type="button"
                variant="prominent"
                size="icon-touch"
                className="hidden cursor-pointer md:inline-flex"
                onClick={handleAdd}
                onPointerEnter={warmAdd}
                onFocus={warmAdd}
                aria-label="Agregar gasto"
              >
                <Plus className="size-5" strokeWidth={2.5} />
              </Button>
              <Button
                type="button"
                variant="glass"
                size="icon-touch"
                className="cursor-pointer text-subhead font-semibold"
                onClick={() => openSettings()}
                onPointerEnter={() => void importSettingsSheet()}
                aria-label="Abrir ajustes"
              >
                {initial}
              </Button>
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
          <main className="@container/main mx-auto w-full px-4 pb-[calc(var(--app-tabbar-space)+2rem)] pt-1 sm:px-6 md:pb-10 lg:px-8 xl:px-10 2xl:px-12">
            <PageEnter>
              <Outlet />
            </PageEnter>
          </main>
        </div>

        <TabBar
          items={navItems}
          onWarm={warmRoute}
          onSelect={goToTab}
          onAdd={handleAdd}
          onWarmAdd={warmAdd}
        />
      </div>

      {settingsMounted ? (
        <Suspense fallback={null}>
          <SettingsSheet
            open={settings.open}
            entry={settings.entry}
            session={settings.session}
            onOpenChange={(open) => setSettings((current) => ({ ...current, open }))}
          />
        </Suspense>
      ) : null}
    </SettingsContext.Provider>
  )
}
