import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

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
