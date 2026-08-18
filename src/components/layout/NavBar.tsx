import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLargeTitleCollapse } from '@/hooks/useLargeTitleCollapse'
import { cn } from '@/lib/utils'

type NavTitle = { title: string; trailing?: ReactNode }

type NavTitleStore = {
  current: NavTitle | null
  setTitle: (title: NavTitle | null) => void
}

const NavTitleContext = createContext<NavTitleStore | null>(null)

/**
 * Puente entre el large title de cada página y el título inline del header.
 * El header vive en `AppShell` y las páginas están debajo del `<Outlet/>`, así
 * que la única forma de que el header sepa qué mostrar al colapsar es que la
 * página lo registre.
 */
export function NavTitleProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [current, setTitle] = useState<NavTitle | null>(null)
  const value = useMemo(() => ({ current, setTitle }), [current])
  return <NavTitleContext.Provider value={value}>{children}</NavTitleContext.Provider>
}

export function useNavTitle() {
  return useContext(NavTitleContext)?.current ?? null
}

type NavBarProps = Readonly<{
  /** Kicker de marca sobre el título */
  eyebrow?: string
  title: string
  trailing?: ReactNode
  /**
   * Remonta el título para volver a disparar el swap. Con `direction` el
   * título entra desde el lado hacia el que navegaste — así el mes se lee
   * como una cinta y no como una lista de opciones.
   */
  swapKey?: string
  direction?: 'next' | 'prev' | 'none'
}>

/**
 * Large title en flujo normal, debajo del header sticky — exactamente como
 * iOS. El header se encarga del título inline cuando esto se colapsa.
 */
export function NavBar({ eyebrow, title, trailing, swapKey, direction = 'none' }: NavBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const store = useContext(NavTitleContext)
  useLargeTitleCollapse(ref)

  const setTitle = store?.setTitle
  useEffect(() => {
    setTitle?.({ title, trailing })
    return () => setTitle?.(null)
  }, [setTitle, title, trailing])

  return (
    <div ref={ref} className="flex items-end justify-between gap-3 pb-4">
      <div className="nav-large-title min-w-0 space-y-1">
        {eyebrow ? <p className="stat-label">{eyebrow}</p> : null}
        <h1
          key={swapKey}
          data-dir={swapKey ? direction : undefined}
          className={cn('page-title capitalize', swapKey && 'swap')}
        >
          {title}
        </h1>
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-1">{trailing}</div> : null}
    </div>
  )
}
