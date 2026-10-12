import { describe, expect, it } from 'vitest'
import { buildMonthReadings } from '@/lib/month-readings'
import { buildMonthReport } from '@/lib/month-report'

const sample = [
  { amount: 100, expense_date: '2026-07-01', description: 'Súper', category: { name: 'Comida' } }, // mié
  { amount: 50, expense_date: '2026-07-04', description: 'Taxi', category: { name: 'Transporte' } }, // sáb
  { amount: 900, expense_date: '2026-07-05', description: 'Alquiler', category: { name: 'Casa' } }, // dom
  { amount: 80, expense_date: '2026-07-10', description: 'Cena', category: { name: 'Comida' } }, // vie
]

const breakdown = [
  { name: 'Comida', total: 180 },
  { name: 'Casa', total: 900 },
  { name: 'Transporte', total: 50 },
]

function ids(expenses: typeof sample, categories = breakdown) {
  return buildMonthReadings(buildMonthReport(expenses, 2026, 7), categories).map((item) => item.id)
}

describe('buildMonthReadings', () => {
  it('no dice nada de un mes sin gastos', () => {
    expect(ids([])).toEqual([])
  })

  it('con un solo gasto no compara', () => {
    expect(ids(sample.slice(0, 1), breakdown.slice(0, 1))).toEqual([])
  })

  it('arma las cinco lecturas de un mes con datos', () => {
    expect(ids(sample)).toEqual(['typical', 'category', 'weekday', 'weekend', 'largest'])
  })

  it('avisa cuando el promedio no representa al gasto típico', () => {
    const readings = buildMonthReadings(buildMonthReport(sample, 2026, 7), breakdown)
    const byId = Object.fromEntries(readings.map((item) => [item.id, item.text]))
    // mediana 90, promedio 282,5
    expect(byId.typical).toContain('pocos gastos grandes')
    expect(byId.category).toBe('Casa concentra el 80% del gasto.')
    expect(byId.weekday).toContain('los domingos')
    expect(byId.weekend).toContain('84%')
    expect(byId.largest).toContain('Alquiler')
  })

  it('omite el fin de semana cuando casi no pesa', () => {
    const weekdays = sample.map((item) => ({ ...item, expense_date: '2026-07-01' }))
    expect(ids(weekdays)).not.toContain('weekend')
    // un solo día de la semana con gasto: tampoco hay "día más caro"
    expect(ids(weekdays)).not.toContain('weekday')
  })
})
