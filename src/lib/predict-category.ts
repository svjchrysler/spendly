import { getExpenseTitle } from '@/lib/expense-display'
import type { Category } from '@/types/database'

export type PredictionConfidence = 'high' | 'medium' | 'low'

export interface ExpenseHistoryItem {
  description: string | null
  category_id: string
}

export interface CategoryPrediction {
  categoryId: string
  categoryName: string
  confidence: PredictionConfidence
}

function normalizeText(text: string) {
  return getExpenseTitle(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
}

function tokenize(text: string) {
  return normalizeText(text)
    .split(/[\s,.-]+/)
    .filter((token) => token.length >= 2)
}

const MIN_SCORE = 6

export function predictCategoryFromDescription(
  description: string,
  history: ExpenseHistoryItem[],
  categories: Category[],
): CategoryPrediction | null {
  const normalized = normalizeText(description)
  if (normalized.length < 2) return null

  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const scores = new Map<string, number>()

  function addScore(categoryId: string, points: number) {
    if (!categoryById.has(categoryId)) return
    scores.set(categoryId, (scores.get(categoryId) ?? 0) + points)
  }

  for (const item of history) {
    if (!item.description?.trim()) continue

    const past = normalizeText(item.description)
    if (!past) continue

    if (past === normalized) {
      addScore(item.category_id, 100)
      continue
    }

    if (past.includes(normalized) || normalized.includes(past)) {
      const shorter = Math.min(past.length, normalized.length)
      const longer = Math.max(past.length, normalized.length)
      const ratio = shorter / longer
      addScore(item.category_id, Math.round(24 * ratio))
      continue
    }

    const inputTokens = tokenize(normalized)
    const pastTokens = tokenize(past)
    if (inputTokens.length === 0 || pastTokens.length === 0) continue

    const shared = inputTokens.filter((token) =>
      pastTokens.some((pastToken) => pastToken.includes(token) || token.includes(pastToken)),
    )
    if (shared.length > 0) {
      addScore(item.category_id, shared.length * 8)
    }
  }

  for (const category of categories) {
    const name = normalizeText(category.name)
    if (name.length >= 3 && normalized.includes(name)) {
      addScore(category.id, 14)
    }

    for (const token of tokenize(category.name)) {
      if (token.length >= 4 && normalized.includes(token)) {
        addScore(category.id, 10)
      }
    }
  }

  let bestId = ''
  let bestScore = 0
  for (const [categoryId, score] of scores) {
    if (score > bestScore) {
      bestScore = score
      bestId = categoryId
    }
  }

  if (!bestId || bestScore < MIN_SCORE) return null

  const category = categoryById.get(bestId)
  if (!category) return null

  let confidence: PredictionConfidence = 'low'
  if (bestScore >= 80) confidence = 'high'
  else if (bestScore >= 18) confidence = 'medium'

  return {
    categoryId: bestId,
    categoryName: category.name,
    confidence,
  }
}
