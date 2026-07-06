import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getMonthRange } from '@/lib/format'
import type { Expense, ExpenseWithCategory } from '@/types/database'

export const expenseKeys = {
  month: (year: number, month: number) => ['expenses', year, month] as const,
}

type ExpenseInput = {
  category_id: string
  amount: number
  description?: string | null
  expense_date: string
}

export function useExpenses(year: number, month: number) {
  const { user } = useAuth()
  const { start, end } = getMonthRange(year, month)

  return useQuery({
    queryKey: expenseKeys.month(year, month),
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ExpenseWithCategory[]
    },
  })
}

export function useCreateExpense(year: number, month: number) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (input: ExpenseInput) => {
      if (!user) throw new Error('No autenticado')
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...input, user_id: user.id })
        .select('*, category:categories(*)')
        .single()

      if (error) throw error
      return data as ExpenseWithCategory
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.month(year, month) })
      const previous = queryClient.getQueryData<ExpenseWithCategory[]>(
        expenseKeys.month(year, month),
      )

      const optimistic: ExpenseWithCategory = {
        id: `temp-${Date.now()}`,
        user_id: user!.id,
        category_id: input.category_id,
        amount: input.amount,
        description: input.description ?? null,
        expense_date: input.expense_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: null,
      }

      queryClient.setQueryData<ExpenseWithCategory[]>(
        expenseKeys.month(year, month),
        (old) => [optimistic, ...(old ?? [])],
      )

      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseKeys.month(year, month), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-budget'] })
    },
  })
}

export function useUpdateExpense(year: number, month: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Pick<Expense, 'id'> & Partial<ExpenseInput>) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(input)
        .eq('id', id)
        .select('*, category:categories(*)')
        .single()

      if (error) throw error
      return data as ExpenseWithCategory
    },
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.month(year, month) })
      const previous = queryClient.getQueryData<ExpenseWithCategory[]>(
        expenseKeys.month(year, month),
      )

      queryClient.setQueryData<ExpenseWithCategory[]>(
        expenseKeys.month(year, month),
        (old) =>
          old?.map((item) =>
            item.id === id ? { ...item, ...input, updated_at: new Date().toISOString() } : item,
          ) ?? [],
      )

      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseKeys.month(year, month), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] })
    },
  })
}

export function useDeleteExpense(year: number, month: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.month(year, month) })
      const previous = queryClient.getQueryData<ExpenseWithCategory[]>(
        expenseKeys.month(year, month),
      )

      queryClient.setQueryData<ExpenseWithCategory[]>(
        expenseKeys.month(year, month),
        (old) => old?.filter((item) => item.id !== id) ?? [],
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseKeys.month(year, month), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-budget'] })
    },
  })
}
