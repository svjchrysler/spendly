import { describe, expect, it } from 'vitest'
import {
  MONTHLY_CAP_BS,
  getMonthlyCapLevel,
  getMonthlyCapMessage,
} from '@/lib/monthly-cap'

describe('getMonthlyCapLevel', () => {
  it('returns ok below 80%', () => {
    expect(getMonthlyCapLevel(0)).toBe('ok')
    expect(getMonthlyCapLevel(MONTHLY_CAP_BS * 0.8 - 1)).toBe('ok')
  })

  it('returns warn from 80% up to just under the cap', () => {
    expect(getMonthlyCapLevel(MONTHLY_CAP_BS * 0.8)).toBe('warn')
    expect(getMonthlyCapLevel(MONTHLY_CAP_BS - 0.01)).toBe('warn')
  })

  it('returns over at or above the cap', () => {
    expect(getMonthlyCapLevel(MONTHLY_CAP_BS)).toBe('over')
    expect(getMonthlyCapLevel(MONTHLY_CAP_BS + 500)).toBe('over')
  })
})

describe('getMonthlyCapMessage', () => {
  it('returns null when under the warn threshold', () => {
    expect(getMonthlyCapMessage(10_000)).toBeNull()
  })

  it('mentions approaching when near the cap', () => {
    const message = getMonthlyCapMessage(16_000)
    expect(message).toMatch(/acercando/)
    expect(message).toMatch(/quedan/)
  })

  it('mentions exceeding when over the cap', () => {
    const message = getMonthlyCapMessage(21_000)
    expect(message).toMatch(/Superaste/)
    expect(message).toMatch(/de más/)
  })
})
