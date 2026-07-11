import { describe, expect, it } from 'vitest'
import { getCurrencySymbol } from '@/lib/currency-config'

describe('getCurrencySymbol', () => {
  it('returns a BOB currency symbol', () => {
    expect(getCurrencySymbol().toLowerCase()).toMatch(/bs/)
  })
})
