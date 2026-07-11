import { describe, expect, it } from 'vitest'
import {
  getCategoryEmoji,
  isEmojiIcon,
  resolveCategoryEmoji,
} from '@/lib/category-emojis'

describe('isEmojiIcon', () => {
  it('detects emoji icons', () => {
    expect(isEmojiIcon('🚕')).toBe(true)
    expect(isEmojiIcon('receipt')).toBe(false)
    expect(isEmojiIcon(null)).toBe(false)
  })
})

describe('getCategoryEmoji', () => {
  it('maps known category names case-insensitively', () => {
    expect(getCategoryEmoji('Taxi')).toBe('🚕')
    expect(getCategoryEmoji('supermercado')).toBe('🛒')
  })

  it('returns null for unknown names', () => {
    expect(getCategoryEmoji('xyz')).toBeNull()
    expect(getCategoryEmoji(null)).toBeNull()
  })
})

describe('resolveCategoryEmoji', () => {
  it('prefers an existing emoji icon', () => {
    expect(resolveCategoryEmoji('🍔', 'Taxi')).toBe('🍔')
  })

  it('falls back to the category name map', () => {
    expect(resolveCategoryEmoji('receipt', 'Taxi')).toBe('🚕')
  })
})
