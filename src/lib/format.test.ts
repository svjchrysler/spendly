import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  capitalize,
  formatCurrency,
  formatCurrencyCompact,
  formatDayLabel,
  formatMonthYear,
  getMonthRange,
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
    expect(formatMonthYear(2026, 7)).toContain('2026')
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
    expect(formatDayLabel('2026-07-01').toLowerCase()).toContain('julio')
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
