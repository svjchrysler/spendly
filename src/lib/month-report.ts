import {
  activeExpenseDays,
  averageTicket,
  dayProgress,
  largestAmount,
  projectedMonthSpend,
} from '@/lib/month-insights'

export type ReportExpense = {
  amount: number
  expense_date: string
  description?: string | null
  category?: { name: string; color?: string } | null
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const

export function medianAmount(amounts: number[]) {
  if (amounts.length === 0) return 0
  const sorted = [...amounts].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2
  }
  return sorted[mid]!
}

export function smallestAmount(amounts: number[]) {
  if (amounts.length === 0) return 0
  return Math.min(...amounts)
}

/** Gasto agrupado por día de la semana (0=dom … 6=sáb). */
export function spendByWeekday(expenses: ReportExpense[]) {
  const buckets = WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    total: 0,
    count: 0,
  }))
  for (const expense of expenses) {
    const weekday = new Date(`${expense.expense_date}T12:00:00`).getDay()
    const bucket = buckets[weekday]!
    bucket.total += Number(expense.amount)
    bucket.count += 1
  }
  return buckets
}

/** Semanas del mes calendario (lun–dom aproximado por bloques de 7 desde el día 1). */
export function spendByWeekOfMonth(expenses: ReportExpense[], year: number, month: number) {
  const days = new Date(year, month, 0).getDate()
  const weekCount = Math.ceil(days / 7)
  const weeks = Array.from({ length: weekCount }, (_, index) => {
    const start = index * 7 + 1
    const end = Math.min((index + 1) * 7, days)
    return {
      index: index + 1,
      label: `Sem ${index + 1}`,
      range: `${start}–${end}`,
      total: 0,
      count: 0,
    }
  })

  for (const expense of expenses) {
    const day = Number(expense.expense_date.slice(8, 10))
    const week = weeks[Math.min(Math.floor((day - 1) / 7), weeks.length - 1)]
    if (!week) continue
    week.total += Number(expense.amount)
    week.count += 1
  }
  return weeks
}

export function topExpenses(expenses: ReportExpense[], limit = 5) {
  return [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, limit)
}

export function weekendShare(expenses: ReportExpense[]) {
  let weekend = 0
  let total = 0
  for (const expense of expenses) {
    const amount = Number(expense.amount)
    total += amount
    const weekday = new Date(`${expense.expense_date}T12:00:00`).getDay()
    if (weekday === 0 || weekday === 6) weekend += amount
  }
  if (total <= 0) return 0
  return (weekend / total) * 100
}

/** Serie diaria + acumulado para el ritmo del mes (hasta hoy si es el mes actual). */
export function dailyPaceSeries(
  expenses: ReportExpense[],
  year: number,
  month: number,
  budget: number | null = null,
  now = new Date(),
) {
  const { dayOfMonth, daysInMonth, isCurrentMonth } = dayProgress(year, month, now)
  const lastDay = isCurrentMonth ? dayOfMonth : daysInMonth
  const byDay = new Map<number, number>()
  for (const expense of expenses) {
    const day = Number(expense.expense_date.slice(8, 10))
    byDay.set(day, (byDay.get(day) ?? 0) + Number(expense.amount))
  }

  let running = 0
  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1
    const daily = byDay.get(day) ?? 0
    running += daily
    return {
      day: String(day),
      dayNum: day,
      daily,
      cumulative: running,
      budget: budget ?? undefined,
    }
  })
}

export function buildMonthReport(
  expenses: ReportExpense[],
  year: number,
  month: number,
  budget: number | null = null,
) {
  const amounts = expenses.map((item) => Number(item.amount))
  const spent = amounts.reduce((sum, value) => sum + value, 0)
  const { dayOfMonth, daysInMonth, isCurrentMonth } = dayProgress(year, month)
  const byWeekday = spendByWeekday(expenses)
  const peakWeekday = byWeekday.reduce(
    (max, item) => (item.total > max.total ? item : max),
    byWeekday[0]!,
  )

  return {
    spent,
    count: expenses.length,
    ticket: averageTicket(spent, expenses.length),
    median: medianAmount(amounts),
    largest: largestAmount(amounts),
    smallest: smallestAmount(amounts),
    activeDays: activeExpenseDays(expenses.map((item) => item.expense_date)),
    projection: projectedMonthSpend(spent, dayOfMonth, daysInMonth),
    dayOfMonth,
    daysInMonth,
    isCurrentMonth,
    budget,
    remaining: budget != null ? budget - spent : null,
    budgetUsedPct: budget != null && budget > 0 ? Math.min((spent / budget) * 100, 999) : null,
    byWeekday,
    byWeek: spendByWeekOfMonth(expenses, year, month),
    peakWeekday,
    weekendPct: weekendShare(expenses),
    top: topExpenses(expenses, 5),
    dailyPace: dailyPaceSeries(expenses, year, month, budget),
  }
}

export type MonthReport = ReturnType<typeof buildMonthReport>
