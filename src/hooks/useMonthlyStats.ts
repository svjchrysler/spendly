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

export function useMonthlyStats(year: number, month: number) {
  const { user } = useAuth()
  const { start, end } = getMonthRange(year, month)

  return useQuery({
    queryKey: ['monthly-stats', year, month],
    enabled: Boolean(user),
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
}

export function useMonthlyHistory(monthsBack = 6) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['monthly-history', monthsBack],
    enabled: Boolean(user),
    queryFn: async () => {
      const now = new Date()
      const results: { year: number; month: number; total: number; label: string }[] = []

      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const { start, end } = getMonthRange(year, month)

        const { data, error } = await supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', start)
          .lte('expense_date', end)

        if (error) throw error

        const total = data.reduce((sum, item) => sum + Number(item.amount), 0)
        results.push({
          year,
          month,
          total,
          label: date.toLocaleDateString('es-ES', { month: 'short' }),
        })
      }

      return results
    },
  })
}
