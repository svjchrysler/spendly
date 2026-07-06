export const appCurrency = import.meta.env.VITE_CURRENCY ?? 'BOB'
export const appLocale = import.meta.env.VITE_CURRENCY_LOCALE ?? 'es-BO'

const currencySymbolFormatter = new Intl.NumberFormat(appLocale, {
  style: 'currency',
  currency: appCurrency,
})

export function getCurrencySymbol() {
  const part = currencySymbolFormatter
    .formatToParts(0)
    .find((item) => item.type === 'currency')
  return part?.value?.trim() ?? 'Bs.'
}
