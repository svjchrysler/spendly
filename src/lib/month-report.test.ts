import { describe, expect, it } from 'vitest'
import {
  buildMonthReport,
  dailyPaceSeries,
  medianAmount,
  spendByWeekday,
  spendByWeekOfMonth,
  weekendShare,
} from '@/lib/month-report'

const sample = [
  { amount: 100, expense_date: '2026-07-01', description: 'A', category: { name: 'Comida' } }, // mié
  { amount: 50, expense_date: '2026-07-04', description: 'B', category: { name: 'Taxi' } }, // sáb
  { amount: 200, expense_date: '2026-07-05', description: 'C', category: { name: 'Casa' } }, // dom
  { amount: 80, expense_date: '2026-07-10', description: 'D', category: { name: 'Comida' } }, // vie
]

const closedNow = new Date('2026-08-01T12:00:00')

describe('month-report', () => {
  it('calcula mediana', () => {
    expect(medianAmount([10, 40, 30])).toBe(30)
    expect(medianAmount([10, 40])).toBe(25)
  })

  it('agrupa por día de semana y fin de semana', () => {
    const byDay = spendByWeekday(sample)
    expect(byDay.reduce((sum, item) => sum + item.total, 0)).toBe(430)
    expect(weekendShare(sample)).toBeCloseTo((250 / 430) * 100)
  })

  it('agrupa por semana del mes', () => {
    const weeks = spendByWeekOfMonth(sample, 2026, 7)
    expect(weeks[0]!.total).toBe(350)
    expect(weeks[1]!.total).toBe(80)
  })

  it('arma serie de ritmo diario en mes cerrado', () => {
    const pace = dailyPaceSeries(sample, 2026, 7, 1000, closedNow)
    expect(pace).toHaveLength(31)
    expect(pace[0]).toMatchObject({ day: '1', daily: 100, cumulative: 100 })
    expect(pace[9]).toMatchObject({ day: '10', daily: 80, cumulative: 430 })
    expect(pace[30]?.cumulative).toBe(430)
    expect(pace[0]?.budget).toBe(1000)
  })

  it('arma el reporte del mes', () => {
    const report = buildMonthReport(sample, 2026, 7, 1000)
    expect(report.spent).toBe(430)
    expect(report.count).toBe(4)
    expect(report.largest).toBe(200)
    expect(report.remaining).toBe(570)
    expect(report.top[0]!.amount).toBe(200)
  })
})
