import { describe, expect, it } from 'vitest'
import { computeMonthlyStats } from '@/lib/month-stats'

const food = { name: 'Comida', color: '#0f0', icon: '🍔' }
const taxi = { name: 'Taxi', color: '#ff0', icon: '🚕' }

describe('computeMonthlyStats', () => {
  it('suma el total y agrupa por categoría', () => {
    const stats = computeMonthlyStats([
      { amount: 100, category_id: 'a', category: food },
      { amount: 50.5, category_id: 'b', category: taxi },
      { amount: 20, category_id: 'a', category: food },
    ])
    expect(stats.total).toBeCloseTo(170.5)
    expect(stats.categoryBreakdown).toEqual([
      { id: 'a', ...food, total: 120, count: 2 },
      { id: 'b', ...taxi, total: 50.5, count: 1 },
    ])
  })

  it('cuenta en el total las filas sin categoría cargada', () => {
    // La fila optimista puede llegar sin join: suma al total, no al desglose
    const stats = computeMonthlyStats([
      { amount: 10, category_id: 'a', category: null },
      { amount: 5, category_id: 'a', category: food },
    ])
    expect(stats.total).toBe(15)
    expect(stats.categoryBreakdown).toEqual([{ id: 'a', ...food, total: 5, count: 1 }])
  })

  it('devuelve vacío para un mes sin gastos', () => {
    expect(computeMonthlyStats([])).toEqual({ total: 0, categoryBreakdown: [] })
  })
})
