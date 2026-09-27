import { getMonthRange } from '@/lib/format'

export type HistoryMonth = {
  year: number
  month: number
  label: string
  total: number
  /**
   * Gastado hasta el día de hoy (`cutoffDay`). Solo difiere de `total` en los
   * meses previos: sirve para comparar un mes en curso "a la misma altura"
   * en vez de contra un mes completo.
   */
  totalToDay: number
  /** El mes ancla es el actual y todavía no terminó */
  inProgress: boolean
  /** Día del mes con el que se corta `totalToDay`; null si el ancla ya cerró */
  cutoffDay: number | null
}

type HistoryRow = { amount: number; expense_date: string }

// Nombres de mes en español siempre (ver lib/format.ts)
const monthLabelFormatter = new Intl.DateTimeFormat('es', { month: 'short' })

/** Rango `[start, end]` de los `monthsBack` meses que terminan en el ancla. */
export function historyRange(year: number, month: number, monthsBack: number) {
  const oldest = new Date(year, month - 1 - (monthsBack - 1), 1)
  return {
    start: getMonthRange(oldest.getFullYear(), oldest.getMonth() + 1).start,
    end: getMonthRange(year, month).end,
  }
}

export function bucketHistory(
  rows: readonly HistoryRow[],
  year: number,
  month: number,
  monthsBack: number,
  now = new Date(),
): HistoryMonth[] {
  const anchorIsCurrent = now.getFullYear() === year && now.getMonth() + 1 === month
  const cutoffDay = anchorIsCurrent ? now.getDate() : null

  const results: HistoryMonth[] = Array.from({ length: monthsBack }, (_, index) => {
    const date = new Date(year, month - 1 - (monthsBack - 1 - index), 1)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: monthLabelFormatter.format(date),
      total: 0,
      totalToDay: 0,
      inProgress: anchorIsCurrent && index === monthsBack - 1,
      cutoffDay,
    }
  })

  const byMonth = new Map(
    results.map((item) => [`${item.year}-${String(item.month).padStart(2, '0')}`, item]),
  )
  for (const row of rows) {
    const bucket = byMonth.get(row.expense_date.slice(0, 7))
    if (!bucket) continue
    const amount = Number(row.amount)
    bucket.total += amount
    if (cutoffDay === null || Number(row.expense_date.slice(8, 10)) <= cutoffDay) {
      bucket.totalToDay += amount
    }
  }

  return results
}
