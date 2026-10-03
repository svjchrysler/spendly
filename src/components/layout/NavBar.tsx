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

type NavTitle = { title: string; subtitle?: string }

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
  title: string
  /** El subtítulo de navegación de iOS 26: va debajo del large title */
  subtitle?: string
  /** Control de la pantalla alineado con el subtítulo (el stepper de mes) */
  trailing?: ReactNode
  /**
   * Remonta el subtítulo para volver a disparar el swap. Con `direction`
   * entra desde el lado hacia el que navegaste — así el mes se lee como una
   * cinta y no como una lista de opciones.
   */
  swapKey?: string
  direction?: 'next' | 'prev' | 'none'
}>

/**
 * Large title en flujo normal, debajo del header sticky — exactamente como
 * iOS. El header se encarga del título inline cuando esto se colapsa.
 */
export function NavBar({ title, subtitle, trailing, swapKey, direction = 'none' }: NavBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const store = useContext(NavTitleContext)
  useLargeTitleCollapse(ref)

  const setTitle = store?.setTitle
  useEffect(() => {
    setTitle?.({ title, subtitle })
    return () => setTitle?.(null)
  }, [setTitle, title, subtitle])

  return (
    <div ref={ref} className="pb-3">
      <div className="nav-large-title min-w-0">
        {/* `vt-page-title`: el large title es el mismo objeto en las tres
            pantallas, así que entre tabs se queda y lo que viaja es el
            contenido de abajo — la lectura de iOS, donde el título pertenece
            a la barra y no a la página. */}
        <h1 className="page-title vt-page-title">{title}</h1>
        {subtitle || trailing ? (
          <div className="mt-0.5 flex min-h-11 items-center justify-between gap-3">
            {subtitle ? (
              <p
                key={swapKey}
                data-dir={swapKey ? direction : undefined}
                className={cn(
                  'truncate text-headline font-normal text-label-secondary first-letter:uppercase',
                  swapKey && 'swap',
                )}
              >
                {subtitle}
              </p>
            ) : (
              <span />
            )}
            {trailing ? <div className="flex shrink-0 items-center">{trailing}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
