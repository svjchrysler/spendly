import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/** Hacia dónde se movió el mes: lo consume el swap direccional del título. */
export type MonthDirection = 'next' | 'prev' | 'none'

interface MonthContextValue {
  year: number
  month: number
  /** `YYYY-MM` — key estable para remontar lo que anima al cambiar de mes */
  monthKey: string
  direction: MonthDirection
  setMonth: (year: number, month: number) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

const MonthContext = createContext<MonthContextValue | null>(null)

export function MonthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonthState] = useState(now.getMonth() + 1)
  const [direction, setDirection] = useState<MonthDirection>('none')
  // Índice (año*12+mes) del mes que era "hoy" en la última mirada
  const todayIndexRef = useRef(now.getFullYear() * 12 + now.getMonth())

  /*
    La PWA puede quedar abierta días en background. Si estabas en el mes
    actual y el calendario pasó al siguiente, al volver seguís en "el mes
    actual" — no en uno viejo que parece vacío. Si estabas mirando otro mes a
    propósito, no se toca.
  */
  useEffect(() => {
    function followToday() {
      if (document.visibilityState !== 'visible') return
      const today = new Date()
      const todayIndex = today.getFullYear() * 12 + today.getMonth()
      const previous = todayIndexRef.current
      todayIndexRef.current = todayIndex
      if (todayIndex === previous || year * 12 + month - 1 !== previous) return
      setDirection(todayIndex > previous ? 'next' : 'prev')
      setYear(today.getFullYear())
      setMonthState(today.getMonth() + 1)
    }
    document.addEventListener('visibilitychange', followToday)
    window.addEventListener('focus', followToday)
    return () => {
      document.removeEventListener('visibilitychange', followToday)
      window.removeEventListener('focus', followToday)
    }
  }, [year, month])

  const value = useMemo<MonthContextValue>(
    () => ({
      year,
      month,
      monthKey: `${year}-${String(month).padStart(2, '0')}`,
      direction,
      setMonth: (y, m) => {
        setDirection(y * 12 + m > year * 12 + month ? 'next' : 'prev')
        setYear(y)
        setMonthState(m)
      },
      goToPreviousMonth: () => {
        setDirection('prev')
        if (month === 1) {
          setYear((y) => y - 1)
          setMonthState(12)
        } else {
          setMonthState((m) => m - 1)
        }
      },
      goToNextMonth: () => {
        setDirection('next')
        if (month === 12) {
          setYear((y) => y + 1)
          setMonthState(1)
        } else {
          setMonthState((m) => m + 1)
        }
      },
    }),
    [year, month, direction],
  )

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  const context = useContext(MonthContext)
  if (!context) throw new Error('useMonth debe usarse dentro de MonthProvider')
  return context
}
