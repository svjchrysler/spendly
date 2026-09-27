import { describe, expect, it } from 'vitest'
import { bucketHistory, historyRange } from '@/lib/month-history'

const rows = [
  { amount: 100, expense_date: '2026-08-05' },
  { amount: 300, expense_date: '2026-08-25' },
  { amount: 50, expense_date: '2026-09-03' },
  { amount: 70, expense_date: '2026-09-10' },
]

describe('bucketHistory', () => {
  it('buckets by month ending at the anchor', () => {
    const history = bucketHistory(rows, 2026, 9, 3, new Date(2026, 10, 15))
    expect(history.map((item) => [item.month, item.total])).toEqual([
      [7, 0],
      [8, 400],
      [9, 120],
    ])
    // Ancla cerrada: sin corte, "hasta hoy" = total
    expect(history[1].totalToDay).toBe(400)
    expect(history[2].inProgress).toBe(false)
  })

  it('cuts previous months at today when the anchor is in progress', () => {
    const history = bucketHistory(rows, 2026, 9, 2, new Date(2026, 8, 12))
    const [august, september] = history
    expect(september.inProgress).toBe(true)
    expect(september.cutoffDay).toBe(12)
    expect(august.total).toBe(400)
    expect(august.totalToDay).toBe(100)
  })

  it('computes the query range across a year boundary', () => {
    expect(historyRange(2026, 2, 6)).toEqual({ start: '2025-09-01', end: '2026-02-28' })
  })
})
