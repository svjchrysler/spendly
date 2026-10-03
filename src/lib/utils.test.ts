import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges conflicting tailwind classes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('keeps iOS text sizes and colors side by side', () => {
    expect(cn('text-subhead text-label', 'text-primary')).toBe('text-subhead text-primary')
    expect(cn('text-body', 'text-footnote')).toBe('text-footnote')
  })
})
