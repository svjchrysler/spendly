import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ExpenseHistoryItem } from '@/lib/predict-category'

export function useExpenseHistory() {
  const { user } = useAuth()

  return useQuery({
    // ponytail: key propia (no ['expenses', …]) — bajo ese prefijo cada alta/baja
    // de gasto invalidaba el historial y re-bajaba 1500 filas solo para predecir.
    // El staleTime + refetchOnWindowFocus lo mantienen suficientemente fresco.
    queryKey: ['expense-history'],
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('description, category_id')
        .order('created_at', { ascending: false })
        .limit(1500)

      if (error) throw error
      return data as ExpenseHistoryItem[]
    },
  })
}
