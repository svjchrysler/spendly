import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Category } from '@/types/database'

export const categoryKeys = {
  all: ['categories'] as const,
}

export function useCategories() {
  const { user } = useAuth()

  return useQuery({
    queryKey: categoryKeys.all,
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Category[]
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (input: Pick<Category, 'name' | 'icon' | 'color'>) => {
      if (!user) throw new Error('No autenticado')
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Pick<Category, 'id'> & Partial<Pick<Category, 'name' | 'icon' | 'color'>>) => {
      const { data, error } = await supabase
        .from('categories')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { count, error: countError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)

      if (countError) throw countError
      if (count && count > 0) {
        throw new Error('No puedes eliminar una categoría con gastos asociados')
      }

      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
