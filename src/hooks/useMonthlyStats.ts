import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getMonthRange } from '@/lib/format'
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['monthly-budget', variables.year, variables.month],
      })
    },
  })
}

type StatRow = {
  amount: number
  category_id: string
  category: { name: string; color: string; icon: string } | null
}

/** Fuente única del agregado del mes — la comparte el prefetch de los tabs. */
export async function fetchMonthlyStats(year: number, month: number) {
  const { start, end } = getMonthRange(year, month)
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, category_id, category:categories(name, color, icon)')
    .gte('expense_date', start)
    .lte('expense_date', end)

  if (error) throw error

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
}

export function useMonthlyStats(year: number, month: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-stats', year, month],
    enabled: Boolean(user),
    queryFn: () => fetchMonthlyStats(year, month),
  })
}

export function useMonthlyHistory(monthsBack = 6) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-history', monthsBack],
    enabled: Boolean(user),
    queryFn: async () => {
      const now = new Date()
      const results = Array.from({ length: monthsBack }, (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (monthsBack - 1 - index),
          1,
        )
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          total: 0,
          label: date.toLocaleDateString('es-ES', { month: 'short' }),
        }
      })

      // ponytail: un round-trip sobre el rango completo y bucketing en cliente.
      // Antes era una query por mes, secuenciales — 6 viajes al abrir Análisis.
      const oldest = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)
      const { start } = getMonthRange(oldest.getFullYear(), oldest.getMonth() + 1)
      const { end } = getMonthRange(now.getFullYear(), now.getMonth() + 1)

      const { data, error } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', start)
        .lte('expense_date', end)

      if (error) throw error

      const byMonth = new Map(
        results.map((item) => [
          `${item.year}-${String(item.month).padStart(2, '0')}`,
          item,
        ]),
      )
      for (const row of data ?? []) {
        const bucket = byMonth.get(row.expense_date.slice(0, 7))
        if (bucket) bucket.total += Number(row.amount)
      }

      return results
    },
  })
}
