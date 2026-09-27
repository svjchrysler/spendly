import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { expenseKeys, fetchMonthExpenses } from '@/hooks/useExpenses'
import { bucketHistory, historyRange } from '@/lib/month-history'
import { computeMonthlyStats } from '@/lib/month-stats'
import type { MonthlyBudget } from '@/types/database'

export function useMonthlyBudget(year: number, month: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-budget', year, month],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()

      if (error) throw error
      return data as MonthlyBudget | null
    },
  })
}

/**
 * El último presupuesto definido antes de este mes. El presupuesto es por mes y
 * antes había que volver a tipearlo cada mes: esto alimenta la sugerencia de
 * "usar el mismo" con un tap. Solo se pide cuando el mes no tiene uno.
 */
export function usePreviousBudget(year: number, month: number, enabled: boolean) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-budget', 'before', year, month],
    enabled: Boolean(user) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .or(`year.lt.${year},and(year.eq.${year},month.lt.${month})`)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data as MonthlyBudget | null
    },
  })
}

export function useUpsertBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      year,
      month,
      amount,
    }: {
      year: number
      month: number
      amount: number
    }) => {
      if (!user) throw new Error('No autenticado')

      const { data, error } = await supabase
        .from('monthly_budgets')
        .upsert(
          { user_id: user.id, year, month, amount },
          { onConflict: 'user_id,year,month' },
        )
        .select()
        .single()

      if (error) throw error
      return data as MonthlyBudget
    },
    // Prefijo entero: la sugerencia "antes de" de los meses siguientes también cambia
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-budget'] })
    },
  })
}

/** Total + desglose del mes, derivados de la lista del mes (misma query y
 *  cache que Gastos): no hay un segundo fetch de las mismas filas. */
export function useMonthlyStats(year: number, month: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: expenseKeys.month(year, month),
    enabled: Boolean(user),
    queryFn: () => fetchMonthExpenses(year, month),
    select: computeMonthlyStats,
  })
}

/** Los `monthsBack` meses que terminan en el mes seleccionado — mirar marzo
 *  muestra oct–mar, no los seis meses hasta hoy. */
export function useMonthlyHistory(year: number, month: number, monthsBack = 6) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-history', year, month, monthsBack],
    enabled: Boolean(user),
    // Cambiar de mes corre la ventana un mes: el chart se queda con la anterior
    // mientras llega la nueva en vez de volver al skeleton
    placeholderData: keepPreviousData,
    queryFn: async () => {
      // ponytail: un round-trip sobre el rango completo y bucketing en cliente.
      // Antes era una query por mes, secuenciales — 6 viajes al abrir Análisis.
      const { start, end } = historyRange(year, month, monthsBack)
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', start)
        .lte('expense_date', end)

      if (error) throw error
      return bucketHistory(data ?? [], year, month, monthsBack)
    },
  })
}
