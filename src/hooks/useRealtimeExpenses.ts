import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { isLocalEcho } from '@/lib/expense-mutations'
import { invalidateExpenseData } from '@/lib/query-client'

/** Una importación o un sync de otro dispositivo llega como ráfaga de eventos:
 *  se juntan en una sola invalidación. */
const BURST_MS = 400

type ExpenseRowRef = { id?: string }

export function useRealtimeExpenses() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    let timer: number | undefined
    const channel = supabase
      .channel('expenses-changes')
      .on<ExpenseRowRef>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // DELETE solo trae `old` (con la PK); INSERT/UPDATE traen `new`
          const id = (payload.new as ExpenseRowRef).id ?? (payload.old as ExpenseRowRef).id
          // Cambio hecho acá: su mutation ya invalidó lo que tocaba
          if (isLocalEcho(id)) return
          window.clearTimeout(timer)
          timer = window.setTimeout(invalidateExpenseData, BURST_MS)
        },
      )
      .subscribe()

    return () => {
      window.clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [user])
}
