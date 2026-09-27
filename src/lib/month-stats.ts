import type { Category, Expense } from '@/types/database'

type StatRow = Pick<Expense, 'amount' | 'category_id'> & {
  category: Pick<Category, 'name' | 'color' | 'icon'> | null
}

export type CategoryBreakdownItem = {
  id: string
  name: string
  color: string
  icon: string
  total: number
  count: number
}

export type MonthlyStats = {
  total: number
  categoryBreakdown: CategoryBreakdownItem[]
}

/*
  El agregado sale de la misma lista del mes que ya baja Gastos/Resumen. Antes
  era una query aparte (`monthly-stats`) que traía las mismas filas otra vez;
  además, al derivarlo, el total sigue al optimistic update — guardar sin red
  sube el número al instante.
*/
export function computeMonthlyStats(rows: readonly StatRow[]): MonthlyStats {
  let total = 0
  const byCategory = new Map<string, CategoryBreakdownItem>()

  for (const row of rows) {
    const amount = Number(row.amount)
    total += amount
    const category = row.category
    if (!category) continue
    const existing = byCategory.get(row.category_id)
    if (existing) {
      existing.total += amount
      existing.count += 1
    } else {
      byCategory.set(row.category_id, {
        id: row.category_id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        total: amount,
        count: 1,
      })
    }
  }

  return { total, categoryBreakdown: Array.from(byCategory.values()) }
}
