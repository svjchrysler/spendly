import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { categoryKeys } from '@/hooks/useCategories'
import {
  expenseMutationKeys,
  type CreateExpenseVars,
  type UpdateExpenseVars,
} from '@/lib/expense-mutations'
import { getMonthRange } from '@/lib/format'
import type { Category, ExpenseWithCategory } from '@/types/database'

export const expenseKeys = {
  month: (year: number, month: number) => ['expenses', year, month] as const,
}

/** Fuente única del fetch del mes — la comparte el prefetch de los tabs. */
export async function fetchMonthExpenses(year: number, month: number) {
  const { start, end } = getMonthRange(year, month)
  const { data, error } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .gte('expense_date', start)
    .lte('expense_date', end)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ExpenseWithCategory[]
}

export function useExpenses(year: number, month: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: expenseKeys.month(year, month),
    enabled: Boolean(user),
    queryFn: () => fetchMonthExpenses(year, month),
  })
}

type MonthSnapshot = [QueryKey, ExpenseWithCategory[] | undefined][]

/*
  El optimistic update va al mes de `expense_date`, no al mes que se está
  viendo: cargar hoy un gasto mientras mirás agosto no debe aparecer en agosto
  y desaparecer después. Por eso se opera sobre todas las listas de mes en
  cache y el rollback restaura todas las que se tocaron.
*/
async function snapshotMonths(queryClient: QueryClient): Promise<MonthSnapshot> {
  await queryClient.cancelQueries({ queryKey: ['expenses'] })
  return queryClient.getQueriesData<ExpenseWithCategory[]>({ queryKey: ['expenses'] })
}

function restoreMonths(queryClient: QueryClient, snapshot: MonthSnapshot | undefined) {
  for (const [key, rows] of snapshot ?? []) queryClient.setQueryData(key, rows)
}

function monthKeyOf(date: string) {
  return expenseKeys.month(Number(date.slice(0, 4)), Number(date.slice(5, 7)))
}

// Mismo orden que fetchMonthExpenses
function byNewest(a: ExpenseWithCategory, b: ExpenseWithCategory) {
  return (
    b.expense_date.localeCompare(a.expense_date) || b.created_at.localeCompare(a.created_at)
  )
}

function dropFromMonths(queryClient: QueryClient, snapshot: MonthSnapshot, id: string) {
  for (const [key, rows] of snapshot) {
    if (rows?.some((row) => row.id === id)) {
      queryClient.setQueryData(key, rows.filter((row) => row.id !== id))
    }
  }
}

/** Mes no cacheado → no se inventa la lista; se baja entera al abrirlo. */
function placeInMonth(queryClient: QueryClient, expense: ExpenseWithCategory) {
  queryClient.setQueryData<ExpenseWithCategory[]>(monthKeyOf(expense.expense_date), (old) =>
    old ? [...old, expense].sort(byNewest) : old,
  )
}

// Sin la categoría la fila optimista pinta sin ícono ni color y salta al refetch
function cachedCategory(queryClient: QueryClient, id: string) {
  return (
    queryClient.getQueryData<Category[]>(categoryKeys.all)?.find((item) => item.id === id) ??
    null
  )
}

/*
  mutationFn, invalidación y reanudación offline vienen de los defaults del
  QueryClient (query-client.ts). Los consumidores no esperan la respuesta: la
  UI ya cambió con el optimistic update, y sin red la mutation queda pausada
  y persistida hasta que vuelva la conexión.
*/
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: expenseMutationKeys.create,
    onMutate: async (vars: CreateExpenseVars) => {
      const snapshot = await snapshotMonths(queryClient)
      const now = new Date().toISOString()
      placeInMonth(queryClient, {
        ...vars,
        description: vars.description ?? null,
        created_at: vars.created_at ?? now,
        updated_at: now,
        category: cachedCategory(queryClient, vars.category_id),
      })
      return { snapshot }
    },
    onError: (_err, _vars, context) => {
      restoreMonths(queryClient, context?.snapshot)
      toast.error('No se pudo guardar el gasto')
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: expenseMutationKeys.update,
    onMutate: async ({ id, ...input }: UpdateExpenseVars) => {
      const snapshot = await snapshotMonths(queryClient)
      const current = snapshot
        .flatMap(([, rows]) => rows ?? [])
        .find((row) => row.id === id)

      if (current) {
        dropFromMonths(queryClient, snapshot, id)
        placeInMonth(queryClient, {
          ...current,
          ...input,
          category: input.category_id
            ? cachedCategory(queryClient, input.category_id)
            : current.category,
          updated_at: new Date().toISOString(),
        })
      }
      return { snapshot }
    },
    onError: (_err, _vars, context) => {
      restoreMonths(queryClient, context?.snapshot)
      toast.error('No se pudo actualizar el gasto')
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: expenseMutationKeys.delete,
    onMutate: async (id: string) => {
      const snapshot = await snapshotMonths(queryClient)
      dropFromMonths(queryClient, snapshot, id)
      return { snapshot }
    },
    onError: (_err, _id, context) => {
      restoreMonths(queryClient, context?.snapshot)
      toast.error('No se pudo eliminar el gasto')
    },
  })
}
