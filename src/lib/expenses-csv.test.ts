import { describe, expect, it } from 'vitest'
import { expensesToCsv } from '@/lib/expenses-csv'

describe('expensesToCsv', () => {
  it('uses ; and decimal comma, with a BOM', () => {
    const csv = expensesToCsv([
      { expense_date: '2026-09-01', amount: 1500.5, description: 'Mercado', category: { name: 'Comida' } },
    ])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toContain('Fecha;Monto;Categoría;Descripción\r\n')
    expect(csv).toContain('2026-09-01;1500,50;Comida;Mercado\r\n')
  })

  it('quotes cells that contain separators or quotes', () => {
    const csv = expensesToCsv([
      { expense_date: '2026-09-02', amount: 10, description: 'Pan; "integral"', category: null },
    ])
    expect(csv).toContain('2026-09-02;10,00;;"Pan; ""integral"""')
  })
})
