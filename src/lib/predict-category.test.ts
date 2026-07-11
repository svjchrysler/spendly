import { describe, expect, it } from 'vitest'
import { predictCategoryFromDescription } from '@/lib/predict-category'
import type { Category } from '@/types/database'

const categories = [
  { id: 'taxi', name: 'Taxi', icon: '🚕', color: '#fff', user_id: '', created_at: '' },
  { id: 'food', name: 'Alimentación', icon: '🍽️', color: '#fff', user_id: '', created_at: '' },
] as Category[]

describe('predictCategoryFromDescription', () => {
  it('returns null for short or empty descriptions', () => {
    expect(predictCategoryFromDescription('', [], categories)).toBeNull()
    expect(predictCategoryFromDescription('a', [], categories)).toBeNull()
  })

  it('matches exact history with high confidence', () => {
    const result = predictCategoryFromDescription(
      'Taxi',
      [{ description: 'Taxi', category_id: 'taxi' }],
      categories,
    )
    expect(result).toEqual({
      categoryId: 'taxi',
      categoryName: 'Taxi',
      confidence: 'high',
    })
  })

  it('matches category name inside the description', () => {
    const result = predictCategoryFromDescription(
      'gasto de alimentación familiar',
      [],
      categories,
    )
    expect(result?.categoryId).toBe('food')
  })

  it('ignores history pointing to unknown categories', () => {
    const result = predictCategoryFromDescription(
      'Taxi',
      [{ description: 'Taxi', category_id: 'missing' }],
      categories,
    )
    expect(result?.categoryId).toBe('taxi')
  })
})
