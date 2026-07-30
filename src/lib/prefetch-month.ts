import type { QueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getMonthRange } from '@/lib/format'
import { expenseKeys } from '@/hooks/useExpenses'

/** Prefetch mes activo al hover de tabs — calienta cache antes del click. */
export function prefetchMonthData(
  queryClient: QueryClient,
  year: number,
  month: number,
) {
  const { start, end } = getMonthRange(year, month)

  void queryClient.prefetchQuery({
    queryKey: expenseKeys.month(year, month),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  void queryClient.prefetchQuery({
    queryKey: ['monthly-stats', year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, category_id, category:categories(name, color, icon)')
        .gte('expense_date', start)
        .lte('expense_date', end)

      if (error) throw error

      type StatRow = {
        amount: number
        category_id: string
        category: { name: string; color: string; icon: string } | null
      }

      const rows = (data ?? []) as StatRow[]
      const total = rows.reduce((sum, item) => sum + Number(item.amount), 0)
      const byCategory = new Map<
        string,
        { name: string; color: string; icon: string; total: number }
      >()

      for (const item of rows) {
        const category = item.category
        if (!category) continue
        const existing = byCategory.get(item.category_id) ?? {
          name: category.name,
          color: category.color,
          icon: category.icon,
          total: 0,
        }
        existing.total += Number(item.amount)
        byCategory.set(item.category_id, existing)
      }

      return {
        total,
        categoryBreakdown: Array.from(byCategory.entries()).map(([id, value]) => ({
          id,
          ...value,
        })),
      }
    },
  })

  void queryClient.prefetchQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}
