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

type ScoreFn = (categoryId: string, points: number) => void

function scoreExactOrPartialMatch(
  normalized: string,
  past: string,
  categoryId: string,
  addScore: ScoreFn,
): boolean {
  if (past === normalized) {
    addScore(categoryId, 100)
    return true
  }

  if (!past.includes(normalized) && !normalized.includes(past)) return false

  const shorter = Math.min(past.length, normalized.length)
  const longer = Math.max(past.length, normalized.length)
  addScore(categoryId, Math.round(24 * (shorter / longer)))
  return true
}

function scoreTokenOverlap(
  normalized: string,
  past: string,
  categoryId: string,
  addScore: ScoreFn,
) {
  const inputTokens = tokenize(normalized)
  const pastTokens = tokenize(past)
  if (inputTokens.length === 0 || pastTokens.length === 0) return

  const shared = inputTokens.filter((token) =>
    pastTokens.some((pastToken) => pastToken.includes(token) || token.includes(pastToken)),
  )
  if (shared.length > 0) addScore(categoryId, shared.length * 8)
}

function scoreFromHistory(
  normalized: string,
  history: ExpenseHistoryItem[],
  addScore: ScoreFn,
) {
  for (const item of history) {
    if (!item.description?.trim()) continue

    const past = normalizeText(item.description)
    if (!past) continue

    const matched = scoreExactOrPartialMatch(
      normalized,
      past,
      item.category_id,
      addScore,
    )
    if (matched) continue

    scoreTokenOverlap(normalized, past, item.category_id, addScore)
  }
}

function scoreFromCategoryNames(
  normalized: string,
  categories: Category[],
  addScore: ScoreFn,
) {
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
}

function bestCategoryId(scores: Map<string, number>) {
  let bestId = ''
  let bestScore = 0
  for (const [categoryId, score] of scores) {
    if (score <= bestScore) continue
    bestScore = score
    bestId = categoryId
  }
  return { bestId, bestScore }
}

function confidenceFromScore(score: number): PredictionConfidence {
  if (score >= 80) return 'high'
  if (score >= 18) return 'medium'
  return 'low'
}

export function predictCategoryFromDescription(
  description: string,
  history: ExpenseHistoryItem[],
  categories: Category[],
): CategoryPrediction | null {
  const normalized = normalizeText(description)
  if (normalized.length < 2) return null

  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const scores = new Map<string, number>()

  const addScore: ScoreFn = (categoryId, points) => {
    if (!categoryById.has(categoryId)) return
    scores.set(categoryId, (scores.get(categoryId) ?? 0) + points)
  }

  scoreFromHistory(normalized, history, addScore)
  scoreFromCategoryNames(normalized, categories, addScore)

  const { bestId, bestScore } = bestCategoryId(scores)
  if (!bestId || bestScore < MIN_SCORE) return null

  const category = categoryById.get(bestId)
  if (!category) return null

  return {
    categoryId: bestId,
    categoryName: category.name,
    confidence: confidenceFromScore(bestScore),
  }
}

// ponytail: smoke-check scoring paths stay stable
if (import.meta.env.DEV) {
  const cats = [
    { id: '1', name: 'Taxi', icon: '🚕', color: '#fff', user_id: '', created_at: '' },
  ] as Category[]
  const exact = predictCategoryFromDescription('Taxi', [{ description: 'Taxi', category_id: '1' }], cats)
  if (exact?.categoryId !== '1' || exact.confidence !== 'high') {
    console.error('predict-category: exact match failed', exact)
  }
}
