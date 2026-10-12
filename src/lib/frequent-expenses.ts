import { getExpenseTitle } from '@/lib/expense-display'
import { foldForSearch } from '@/lib/format'
import type { ExpenseHistoryItem } from '@/lib/predict-category'

export type FrequentExpense = {
  /** Tal como se escribió la última vez (con su emoji, si lo tenía) */
  description: string
  categoryId: string
  count: number
}

/** Una sola aparición no es un hábito */
const MIN_COUNT = 2

/**
 * Las descripciones que más se repiten en el historial, para cargarlas con un
 * toque. `history` viene del más reciente al más antiguo: la primera aparición
 * de cada descripción da la grafía y la categoría vigentes.
 *
 * Se agrupa sin mayúsculas, tildes ni emoji — "Café ☕" y "cafe" son el mismo
 * gasto. Las que apuntan a una categoría que ya no existe se descartan.
 */
export function frequentExpenses(
  history: readonly ExpenseHistoryItem[],
  categoryIds: ReadonlySet<string>,
  limit = 6,
): FrequentExpense[] {
  const byKey = new Map<string, FrequentExpense>()

  for (const item of history) {
    const description = item.description?.trim()
    if (!description) continue
    const key = foldForSearch(getExpenseTitle(description))
    if (!key) continue

    const existing = byKey.get(key)
    if (existing) existing.count += 1
    else byKey.set(key, { description, categoryId: item.category_id, count: 1 })
  }

  // `sort` es estable: a igual frecuencia gana el más reciente (orden de inserción)
  return Array.from(byKey.values())
    .filter((item) => item.count >= MIN_COUNT && categoryIds.has(item.categoryId))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
