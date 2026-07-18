/** Insights derivados del mes — puro, sin UI. */

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export function dayProgress(
  year: number,
  month: number,
  now = new Date(),
): { dayOfMonth: number; daysInMonth: number; isCurrentMonth: boolean } {
  const total = daysInMonth(year, month)
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month
  return {
    dayOfMonth: isCurrentMonth ? now.getDate() : total,
    daysInMonth: total,
    isCurrentMonth,
  }
}

/** Proyección a fin de mes al ritmo actual. */
export function projectedMonthSpend(spent: number, dayOfMonth: number, daysTotal: number) {
  if (dayOfMonth <= 0 || daysTotal <= 0) return 0
  return (spent / dayOfMonth) * daysTotal
}

export function averageTicket(spent: number, count: number) {
  if (count <= 0) return 0
  return spent / count
}

export function dailyBudgetRemaining(
  budget: number | null,
  spent: number,
  dayOfMonth: number,
  daysTotal: number,
): number | null {
  if (budget == null) return null
  const remaining = budget - spent
  const daysLeft = Math.max(daysTotal - dayOfMonth, 0)
  if (daysLeft <= 0) return remaining
  return remaining / daysLeft
}

export function activeExpenseDays(dates: string[]) {
  return new Set(dates).size
}

export function largestAmount(amounts: number[]) {
  if (amounts.length === 0) return 0
  return Math.max(...amounts)
}

/** % del total concentrado en las N categorías más altas. */
export function topShare(
  items: { total: number }[],
  spent: number,
  limit: number,
) {
  if (spent <= 0 || items.length === 0) return 0
  const sorted = [...items].sort((a, b) => b.total - a.total)
  const top = sorted.slice(0, limit).reduce((sum, item) => sum + item.total, 0)
  return (top / spent) * 100
}
