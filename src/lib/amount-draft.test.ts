import { describe, expect, it } from 'vitest'
import { formatAmountDraft, parseAmountDraft, toAmountDraft } from '@/lib/amount-draft'

describe('amount draft (es-BO)', () => {
  it.each([
    ['12000', '12.000', 12000],
    ['1.2000', '12.000', 12000],
    ['12.000', '12.000', 12000],
    ['1,20', '1,20', 1.2],
    ['1.5', '1,5', 1.5],
    ['1500,50', '1.500,50', 1500.5],
    ['007', '7', 7],
  ])('%s → %s', (input, draft, value) => {
    const out = formatAmountDraft(input)
    expect(out).toBe(draft)
    expect(parseAmountDraft(out)).toBe(value)
  })

  it('treats an empty draft as no value', () => {
    expect(parseAmountDraft('')).toBeUndefined()
    expect(parseAmountDraft(',')).toBeUndefined()
  })

  it('renders a stored number back as a draft', () => {
    expect(toAmountDraft(1500.5)).toBe('1.500,50')
    expect(toAmountDraft(undefined)).toBe('')
  })
})
