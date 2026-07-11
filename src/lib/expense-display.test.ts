import { describe, expect, it } from 'vitest'
import {
  extractExpenseEmoji,
  getExpenseLabel,
  getExpenseTitle,
} from '@/lib/expense-display'

describe('extractExpenseEmoji', () => {
  it('returns null for empty input', () => {
    expect(extractExpenseEmoji(null)).toBeNull()
    expect(extractExpenseEmoji('')).toBeNull()
    expect(extractExpenseEmoji('almuerzo')).toBeNull()
  })

  it('extracts the first emoji', () => {
    expect(extractExpenseEmoji('🍕 pizza')).toBe('🍕')
  })
})

describe('getExpenseTitle', () => {
  it('strips emoji and hashtags', () => {
    expect(getExpenseTitle('🍕 cena #salida')).toBe('cena')
  })

  it('collapses whitespace', () => {
    expect(getExpenseTitle('  taxi   centro  ')).toBe('taxi centro')
  })
})

describe('getExpenseLabel', () => {
  it('prefers title, then category, then fallback', () => {
    expect(getExpenseLabel('🍕 cena', 'Alimentación')).toBe('cena')
    expect(getExpenseLabel('🍕', 'Alimentación')).toBe('Alimentación')
    expect(getExpenseLabel(null, null)).toBe('Gasto')
  })
})
