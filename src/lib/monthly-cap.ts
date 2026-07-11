import { formatCurrency } from '@/lib/format'

/** ponytail: hard cap Bs/mes — mover a settings si cambia */
export const MONTHLY_CAP_BS = 20_000
export const MONTHLY_CAP_WARN_RATIO = 0.8

export type MonthlyCapLevel = 'ok' | 'warn' | 'over'

export function getMonthlyCapLevel(spent: number): MonthlyCapLevel {
  if (spent >= MONTHLY_CAP_BS) return 'over'
  if (spent >= MONTHLY_CAP_BS * MONTHLY_CAP_WARN_RATIO) return 'warn'
  return 'ok'
}

export function getMonthlyCapMessage(spent: number): string | null {
  const level = getMonthlyCapLevel(spent)
  if (level === 'ok') return null

  const remaining = MONTHLY_CAP_BS - spent
  if (level === 'over') {
    return `Superaste el máximo mensual de ${formatCurrency(MONTHLY_CAP_BS)} · ${formatCurrency(Math.abs(remaining))} de más`
  }

  return `Te estás acercando al máximo mensual de ${formatCurrency(MONTHLY_CAP_BS)} · quedan ${formatCurrency(remaining)}`
}
