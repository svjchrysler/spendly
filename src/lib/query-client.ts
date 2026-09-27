import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { toast } from 'sonner'
import {
  expenseMutationKeys,
  insertExpense,
  patchExpense,
  removeExpense,
} from '@/lib/expense-mutations'
import type { ExpenseHistoryItem } from '@/lib/predict-category'
import type { ExpenseWithCategory } from '@/types/database'

const WEEK_MS = 1000 * 60 * 60 * 24 * 7

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Warm enough that tab switches / brief app backgrounding feel instant
      staleTime: 1000 * 90,
      // Keep cached rows around for offline reopen
      gcTime: WEEK_MS,
      retry: (failureCount) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'online',
      retry: false,
    },
  },
})

/*
  El prefijo `['expenses']` cubre todos los meses, pero invalidar solo re-baja
  las queries activas (el mes en pantalla); las otras quedan stale y se bajan
  al visitarlas. Las stats del mes salen de esa misma lista, y el presupuesto
  no depende de los gastos: no hay nada más que invalidar acá.
*/
export function invalidateExpenseData() {
  void queryClient.invalidateQueries({ queryKey: ['expenses'] })
  void queryClient.invalidateQueries({ queryKey: ['monthly-history'] })
}

/** El gasto recién guardado entra ya a la predicción, sin re-bajar el historial. */
function rememberForPrediction(expense: ExpenseWithCategory) {
  if (!expense.description) return
  queryClient.setQueryData<ExpenseHistoryItem[]>(['expense-history'], (old) =>
    old
      ? [{ description: expense.description, category_id: expense.category_id }, ...old]
      : old,
  )
}

/*
  Defaults por mutationKey: es lo único que tiene una mutation reanudada tras
  reabrir la app sin red (el hook que la creó ya no existe). Los hooks suman el
  optimistic update y el rollback encima. `scope` las serializa: un alta y el
  borrado de ese mismo gasto nunca corren en paralelo ni fuera de orden.
*/
const expenseScope = { id: 'expenses' }
const expenseDefaults = {
  scope: expenseScope,
  onSettled: invalidateExpenseData,
}

queryClient.setMutationDefaults(expenseMutationKeys.create, {
  ...expenseDefaults,
  mutationFn: insertExpense,
  onSuccess: rememberForPrediction,
  onError: () => toast.error('No se pudo sincronizar un gasto guardado sin conexión'),
})
queryClient.setMutationDefaults(expenseMutationKeys.update, {
  ...expenseDefaults,
  mutationFn: patchExpense,
  onSuccess: rememberForPrediction,
  onError: () => toast.error('No se pudo sincronizar un cambio hecho sin conexión'),
})
queryClient.setMutationDefaults(expenseMutationKeys.delete, {
  ...expenseDefaults,
  mutationFn: removeExpense,
  onError: () => toast.error('No se pudo sincronizar un borrado hecho sin conexión'),
})

export const queryPersister = createSyncStoragePersister({
  storage: typeof window === 'undefined' ? undefined : window.localStorage,
  key: 'spendly-query-cache',
})

export const queryPersistOptions = {
  persister: queryPersister,
  maxAge: WEEK_MS,
  // ponytail: bump to wipe bad caches after schema/query-key changes
  buster: 'v4',
}
