import type { QueryClient } from '@tanstack/react-query'
import { categoryKeys, fetchCategories } from '@/hooks/useCategories'
import { expenseKeys, fetchMonthExpenses } from '@/hooks/useExpenses'
import { fetchMonthlyStats } from '@/hooks/useMonthlyStats'

/** Prefetch mes activo al hover de tabs — calienta cache antes del click. */
export function prefetchMonthData(
  queryClient: QueryClient,
  year: number,
  month: number,
) {
  void queryClient.prefetchQuery({
    queryKey: expenseKeys.month(year, month),
    queryFn: () => fetchMonthExpenses(year, month),
  })

  void queryClient.prefetchQuery({
    queryKey: ['monthly-stats', year, month],
    queryFn: () => fetchMonthlyStats(year, month),
  })

  void queryClient.prefetchQuery({
    queryKey: categoryKeys.all,
    queryFn: fetchCategories,
  })
}
