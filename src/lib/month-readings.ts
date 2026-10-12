import { getExpenseLabel } from '@/lib/expense-display'
import { formatCurrency } from '@/lib/format'
import type { MonthReport } from '@/lib/month-report'

export type MonthReading = {
  id: 'typical' | 'weekday' | 'weekend' | 'largest' | 'category'
  text: string
}

/** Índice de `Date.getDay()` */
const WEEKDAY_PLURAL = [
  'los domingos',
  'los lunes',
  'los martes',
  'los miércoles',
  'los jueves',
  'los viernes',
  'los sábados',
] as const

/** A partir de cuánto el promedio deja de parecerse al gasto típico */
const SKEW_RATIO = 1.25
/** Debajo de esto el fin de semana no es noticia */
const WEEKEND_MIN_PCT = 10

function pct(value: number) {
  return `${Math.round(value)}%`
}

/**
 * El mes dicho en frases. Cada lectura sale de un dato del reporte y se omite
 * si ese dato no alcanza para afirmar algo: con un solo gasto no hay "gasto
 * típico" ni "día más caro", solo un número repetido cinco veces.
 */
export function buildMonthReadings(
  report: MonthReport,
  breakdown: readonly { name: string; total: number }[],
): MonthReading[] {
  if (report.count === 0 || report.spent <= 0) return []
  const readings: MonthReading[] = []

  if (report.count >= 2) {
    const skewed = report.ticket > report.median * SKEW_RATIO
    readings.push({
      id: 'typical',
      text: skewed
        ? `Tu gasto típico ronda ${formatCurrency(report.median)}; el promedio sube a ${formatCurrency(report.ticket)} por unos pocos gastos grandes.`
        : `Tu gasto típico ronda ${formatCurrency(report.median)}.`,
    })
  }

  const top = [...breakdown].sort((a, b) => b.total - a.total)[0]
  if (top && breakdown.length >= 2 && top.total > 0) {
    readings.push({
      id: 'category',
      text: `${top.name} concentra el ${pct((top.total / report.spent) * 100)} del gasto.`,
    })
  }

  const weekdaysWithSpend = report.byWeekday.filter((item) => item.total > 0).length
  if (weekdaysWithSpend >= 2 && report.peakWeekday.total > 0) {
    const { weekday, total, count } = report.peakWeekday
    readings.push({
      id: 'weekday',
      text: `Gastas más ${WEEKDAY_PLURAL[weekday]}: ${formatCurrency(total)} en ${count} ${count === 1 ? 'gasto' : 'gastos'}.`,
    })
  }

  if (report.count >= 3 && report.weekendPct >= WEEKEND_MIN_PCT) {
    readings.push({
      id: 'weekend',
      text: `El fin de semana se lleva el ${pct(report.weekendPct)} del mes.`,
    })
  }

  const largest = report.top[0]
  if (report.count >= 2 && largest) {
    readings.push({
      id: 'largest',
      text: `El mayor gasto fue ${getExpenseLabel(largest.description, largest.category?.name)}: ${formatCurrency(report.largest)}, el ${pct((report.largest / report.spent) * 100)} del mes.`,
    })
  }

  return readings
}
