import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { appCurrency, appLocale } from '@/lib/currency-config'

// ponytail: construir Intl.NumberFormat es caro y formatCurrency corre por fila
// de lista y por tick de chart — cacheamos una instancia por (moneda, notación).
const numberFormatters = new Map<string, Intl.NumberFormat>()

function currencyFormatter(currency: string, compact: boolean) {
  const key = `${currency}:${compact}`
  let formatter = numberFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(
      appLocale,
      compact
        ? { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }
        : { style: 'currency', currency, minimumFractionDigits: 2 },
    )
    numberFormatters.set(key, formatter)
  }
  return formatter
}

export function formatCurrency(amount: number, currency = appCurrency) {
  return currencyFormatter(currency, false).format(amount)
}

export function formatCurrencyCompact(amount: number, currency = appCurrency) {
  return currencyFormatter(currency, true).format(amount)
}

export function formatMonthYear(year: number, month: number) {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: es })
}

export function formatDayLabel(dateStr: string) {
  const date = parseISO(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return format(date, "d 'de' MMMM", { locale: es })
}

export function getMonthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
