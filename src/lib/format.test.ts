import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  capitalize,
  defaultExpenseDate,
  foldForSearch,
  formatCurrency,
  formatCurrencyCompact,
  formatDayLabel,
  formatMonthYear,
  getMonthRange,
  toDateString,
} from '@/lib/format'

describe('formatCurrency', () => {
  it('formats BOB amounts with decimals', () => {
    const formatted = formatCurrency(16236.47)
    expect(formatted).toMatch(/16[.  ]?236[,.]47/)
    expect(formatted.toLowerCase()).toMatch(/bs/)
  })

  it('reuses the cached formatter without changing output', () => {
    // El cache es por (moneda, notación): repetir y alternar no debe filtrar
    // opciones de una variante a la otra.
    expect(formatCurrency(1234.5)).toBe(formatCurrency(1234.5))
    expect(formatCurrency(1234.5)).not.toBe(formatCurrencyCompact(1234.5))
    expect(formatCurrency(1234.5)).toMatch(/50/)
  })

  it('honours an explicit currency override', () => {
    const usd = formatCurrency(10, 'USD')
    expect(usd).toMatch(/10[,.]00/)
    expect(usd).not.toBe(formatCurrency(10))
  })
})

describe('formatCurrencyCompact', () => {
  it('uses compact notation for large amounts', () => {
    const formatted = formatCurrencyCompact(16_000)
    expect(formatted.toLowerCase()).toMatch(/bs/)
    expect(formatted).toMatch(/16/)
  })
})

describe('formatMonthYear', () => {
  it('returns a Spanish month label', () => {
    expect(formatMonthYear(2026, 7).toLowerCase()).toContain('julio')
    expect(formatMonthYear(2026, 7)).toBe('julio 2026')
  })
})

describe('formatDayLabel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('labels today and yesterday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 11))

    expect(formatDayLabel('2026-07-11')).toBe('Hoy')
    expect(formatDayLabel('2026-07-10')).toBe('Ayer')
    expect(formatDayLabel('2026-07-01')).toBe('1 de julio')
  })
})

describe('getMonthRange', () => {
  it('returns inclusive start and end dates', () => {
    expect(getMonthRange(2026, 2)).toEqual({
      start: '2026-02-01',
      end: '2026-02-28',
    })
    expect(getMonthRange(2024, 2)).toEqual({
      start: '2024-02-01',
      end: '2024-02-29',
    })
  })
})

describe('capitalize', () => {
  it('uppercases the first character', () => {
    expect(capitalize('julio')).toBe('Julio')
    expect(capitalize('')).toBe('')
  })
})

describe('toDateString', () => {
  it('uses the local calendar day, not UTC', () => {
    // 23:30 local: en cualquier zona al oeste de UTC, toISOString ya es mañana
    expect(toDateString(new Date(2026, 8, 30, 23, 30))).toBe('2026-09-30')
    expect(toDateString(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01')
  })
})

describe('defaultExpenseDate', () => {
  const now = new Date(2026, 8, 27, 21, 0)

  it('is today when viewing the current month', () => {
    expect(defaultExpenseDate(2026, 9, now)).toBe('2026-09-27')
  })

  it('clamps into the viewed month otherwise', () => {
    expect(defaultExpenseDate(2026, 8, now)).toBe('2026-08-31')
    expect(defaultExpenseDate(2025, 12, now)).toBe('2025-12-31')
    expect(defaultExpenseDate(2026, 11, now)).toBe('2026-11-01')
  })
})

describe('foldForSearch', () => {
  it('ignores case and accents', () => {
    expect(foldForSearch('Café Ñandú')).toBe('cafe nandu')
    expect(foldForSearch('Café').includes(foldForSearch('cafe'))).toBe(true)
  })
})
