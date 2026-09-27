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

/*
  Intl en vez de date-fns: `format` + el locale `es` viajaban en el chunk de
  entrada solo por estas dos funciones. El date picker (lazy) sigue con date-fns.
  Los nombres de mes van en español siempre: la UI lo está, la moneda no manda.
*/
const monthFormatter = new Intl.DateTimeFormat('es', { month: 'long' })
const dayMonthFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' })

/** `YYYY-MM-DD` → Date local (sin el corrimiento UTC de `new Date(str)`) */
function parseDateString(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatMonthYear(year: number, month: number) {
  // "julio 2026", sin el "de" que agrega Intl en es
  return `${monthFormatter.format(new Date(year, month - 1, 1))} ${year}`
}

export function formatDayLabel(dateStr: string) {
  const date = parseDateString(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return dayMonthFormatter.format(date)
}

/** `YYYY-MM-DD` en hora local — `toISOString()` es UTC y en Bolivia (UTC-4)
 *  desde las 20:00 devuelve la fecha de mañana. */
export function toDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Fecha por defecto de un gasto nuevo: hoy si mirás el mes actual; si no,
 *  el día más cercano a hoy dentro del mes que estás viendo. */
export function defaultExpenseDate(year: number, month: number, now = new Date()) {
  const viewed = year * 12 + month
  const current = now.getFullYear() * 12 + now.getMonth() + 1
  if (viewed === current) return toDateString(now)
  const { start, end } = getMonthRange(year, month)
  return viewed < current ? end : start
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

/** Para comparar en búsquedas: sin mayúsculas ni tildes — "cafe" encuentra "Café". */
export function foldForSearch(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}
