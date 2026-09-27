/*
  Borrador de monto en es-BO mientras se tipea: el punto agrupa miles y la coma
  es decimal. Lo comparten el monto del gasto y el presupuesto — un
  `type="number"` con teclado en español rechaza la coma y devuelve vacío.
*/

/** es-BO while typing: 1.234,56 — dots are thousands, comma is decimal */
export function formatAmountDraft(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, '')

  let intDigits = ''
  let decDigits: string | null = null

  if (cleaned.includes(',')) {
    const [left, ...rest] = cleaned.split(',')
    intDigits = left.replace(/\D/g, '')
    decDigits = rest.join('').replace(/\D/g, '').slice(0, 2)
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.')
    const last = parts.at(-1) ?? ''
    if (parts.length === 2 && last.length <= 2) {
      intDigits = parts[0]?.replace(/\D/g, '') ?? ''
      decDigits = last.replace(/\D/g, '')
    } else {
      intDigits = parts.join('').replace(/\D/g, '')
    }
  } else {
    intDigits = cleaned.replace(/\D/g, '')
  }

  intDigits = intDigits.replace(/^0+(?=\d)/, '')
  if (!intDigits && decDigits != null) intDigits = '0'

  const withDots = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  if (decDigits != null) return `${withDots || '0'},${decDigits}`
  return withDots
}

export function parseAmountDraft(draft: string): number | undefined {
  if (!draft || draft === ',') return undefined
  const normalized = draft.replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : undefined
}

export function toAmountDraft(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return ''
  return formatAmountDraft(value.toFixed(2).replace('.', ','))
}
