import { describe, expect, it } from 'vitest'
import { frequentExpenses } from '@/lib/frequent-expenses'

const categories = new Set(['comida', 'transporte'])

// Del más reciente al más antiguo, como lo devuelve `useExpenseHistory`
const history = [
  { description: 'Almuerzo', category_id: 'comida' },
  { description: 'Taxi', category_id: 'transporte' },
  { description: 'almuerzo ', category_id: 'transporte' },
  { description: 'Café ☕', category_id: 'comida' },
  { description: 'ALMUERZO', category_id: 'comida' },
  { description: 'cafe', category_id: 'comida' },
  { description: 'Taxi', category_id: 'transporte' },
  { description: 'Regalo', category_id: 'comida' },
  { description: null, category_id: 'comida' },
]

describe('frequentExpenses', () => {
  it('ordena por frecuencia y toma la grafía y categoría más recientes', () => {
    expect(frequentExpenses(history, categories)).toEqual([
      { description: 'Almuerzo', categoryId: 'comida', count: 3 },
      { description: 'Taxi', categoryId: 'transporte', count: 2 },
      { description: 'Café ☕', categoryId: 'comida', count: 2 },
    ])
  })

  it('descarta lo que apareció una sola vez', () => {
    const names = frequentExpenses(history, categories).map((item) => item.description)
    expect(names).not.toContain('Regalo')
  })

  it('descarta descripciones cuya categoría ya no existe', () => {
    const names = frequentExpenses(history, new Set(['comida'])).map((item) => item.description)
    expect(names).toEqual(['Almuerzo', 'Café ☕'])
  })

  it('respeta el límite y tolera historial vacío', () => {
    expect(frequentExpenses(history, categories, 1)).toHaveLength(1)
    expect(frequentExpenses([], categories)).toEqual([])
  })
})
