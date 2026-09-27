import { supabase } from '@/lib/supabase'
import type { ExpenseWithCategory } from '@/types/database'

/*
  Los mutationFn viven acá y no en el hook: se registran como defaults del
  QueryClient (ver query-client.ts). Una mutation pausada sin red se persiste
  con sus variables, y al reabrir la app solo puede reanudarse si su función
  se encuentra por mutationKey — una closure del componente no sobrevive.
*/
export const expenseMutationKeys = {
  create: ['expenses', 'create'] as const,
  update: ['expenses', 'update'] as const,
  delete: ['expenses', 'delete'] as const,
}

export type ExpenseInput = {
  category_id: string
  amount: number
  description?: string | null
  expense_date: string
}

/** `id` lo genera el cliente: la fila optimista y la real son la misma, así
 *  editar o borrar un gasto aún sin sincronizar apunta al id correcto. */
export type CreateExpenseVars = ExpenseInput & {
  id: string
  user_id: string
  /** Solo al deshacer un borrado: conserva el lugar de la fila en su día */
  created_at?: string
}

export type UpdateExpenseVars = Partial<ExpenseInput> & { id: string }

/*
  Realtime también emite los cambios hechos desde este dispositivo, y para
  entonces la mutation ya invalidó su propia data: sin este registro cada alta
  se re-bajaba dos veces. Se marca antes del request porque el evento puede
  llegar antes que la respuesta HTTP.
*/
const LOCAL_ECHO_MS = 10_000
const localChanges = new Map<string, number>()

function markLocalChange(id: string) {
  localChanges.set(id, Date.now())
}

export function isLocalEcho(id: string | undefined) {
  if (!id) return false
  const at = localChanges.get(id)
  if (at === undefined) return false
  if (Date.now() - at > LOCAL_ECHO_MS) {
    localChanges.delete(id)
    return false
  }
  return true
}

export async function insertExpense(vars: CreateExpenseVars) {
  markLocalChange(vars.id)
  const { data, error } = await supabase
    .from('expenses')
    .insert(vars)
    .select('*, category:categories(*)')
    .single()

  if (error) throw error
  return data as ExpenseWithCategory
}

export async function patchExpense({ id, ...input }: UpdateExpenseVars) {
  markLocalChange(id)
  const { data, error } = await supabase
    .from('expenses')
    .update(input)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single()

  if (error) throw error
  return data as ExpenseWithCategory
}

export async function removeExpense(id: string) {
  markLocalChange(id)
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}
