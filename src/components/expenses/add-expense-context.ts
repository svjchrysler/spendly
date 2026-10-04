import { createContext, useContext } from 'react'

export type AddExpenseApi = Readonly<{
  /** Abre el sheet de nuevo gasto */
  openAdd: () => void
  /** Precarga el form (hover/focus del botón): el sheet abre con todo listo */
  warmAdd: () => void
}>

export const AddExpenseContext = createContext<AddExpenseApi | null>(null)

/** Agregar gasto es global: el botón del tab bar y los estados vacíos lo usan */
export function useAddExpense() {
  const context = useContext(AddExpenseContext)
  if (!context) throw new Error('useAddExpense debe usarse dentro de AddExpenseProvider')
  return context
}
