import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface MonthContextValue {
  year: number
  month: number
  setMonth: (year: number, month: number) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

const MonthContext = createContext<MonthContextValue | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonthState] = useState(now.getMonth() + 1)

  const value = useMemo<MonthContextValue>(
    () => ({
      year,
      month,
      setMonth: (y, m) => {
        setYear(y)
        setMonthState(m)
      },
      goToPreviousMonth: () => {
        if (month === 1) {
          setYear((y) => y - 1)
          setMonthState(12)
        } else {
          setMonthState((m) => m - 1)
        }
      },
      goToNextMonth: () => {
        if (month === 12) {
          setYear((y) => y + 1)
          setMonthState(1)
        } else {
          setMonthState((m) => m + 1)
        }
      },
    }),
    [year, month],
  )

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  const context = useContext(MonthContext)
  if (!context) throw new Error('useMonth debe usarse dentro de MonthProvider')
  return context
}
