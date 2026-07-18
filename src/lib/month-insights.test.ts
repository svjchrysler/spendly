import { describe, expect, it } from 'vitest'
import {
  activeExpenseDays,
  averageTicket,
  dailyBudgetRemaining,
  dayProgress,
  largestAmount,
  projectedMonthSpend,
  topShare,
} from '@/lib/month-insights'

describe('month-insights', () => {
  it('proyecta el mes al ritmo del día', () => {
    expect(projectedMonthSpend(3000, 10, 30)).toBe(9000)
    expect(projectedMonthSpend(0, 5, 30)).toBe(0)
  })

  it('calcula ticket medio y mayor monto', () => {
    expect(averageTicket(100, 4)).toBe(25)
    expect(averageTicket(100, 0)).toBe(0)
    expect(largestAmount([10, 40, 5])).toBe(40)
  })

  it('presupuesto diario restante', () => {
    expect(dailyBudgetRemaining(3000, 1000, 10, 30)).toBeCloseTo(100)
    expect(dailyBudgetRemaining(null, 1000, 10, 30)).toBeNull()
  })

  it('días con gasto y share top N', () => {
    expect(activeExpenseDays(['2026-07-01', '2026-07-01', '2026-07-02'])).toBe(2)
    expect(topShare([{ total: 60 }, { total: 30 }, { total: 10 }], 100, 2)).toBe(90)
  })

  it('dayProgress marca mes actual', () => {
    const now = new Date(2026, 6, 17)
    expect(dayProgress(2026, 7, now)).toEqual({
      dayOfMonth: 17,
      daysInMonth: 31,
      isCurrentMonth: true,
    })
  })
})
