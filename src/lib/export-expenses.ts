import { supabase } from '@/lib/supabase'
import { expensesToCsv } from '@/lib/expenses-csv'
import { toDateString } from '@/lib/format'

// PostgREST corta en 1000 filas por request (max-rows del proyecto)
const PAGE = 1000

/** Baja todos los gastos del usuario y dispara la descarga del CSV. */
export async function downloadExpensesCsv() {
  const rows = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('expenses')
      .select('expense_date, amount, description, category:categories(name)')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)

    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE) break
  }

  const blob = new Blob([expensesToCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `spendly-gastos-${toDateString(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(url)
  return rows.length
}
