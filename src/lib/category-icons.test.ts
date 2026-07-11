import { describe, expect, it } from 'vitest'
import { Receipt, Utensils } from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'

describe('getCategoryIcon', () => {
  it('returns the mapped lucide icon', () => {
    expect(getCategoryIcon('utensils')).toBe(Utensils)
  })

  it('falls back to Receipt for unknown names', () => {
    expect(getCategoryIcon('nope')).toBe(Receipt)
  })
})
