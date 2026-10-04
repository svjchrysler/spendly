import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AddExpenseContext } from '@/components/expenses/add-expense-context'
import { ExpenseFormSkeleton } from '@/components/layout/skeletons'
import { FormSheet, SheetConfirmButton } from '@/components/ui/form-sheet'

// react-hook-form + zod viven solo acá: fuera del chunk de entrada. Se
// precalienta en idle y al hover/press del botón, así el sheet abre listo.
const importExpenseForm = () => import('@/components/expenses/ExpenseForm')
const ExpenseForm = lazy(() =>
  importExpenseForm().then((module) => ({ default: module.ExpenseForm })),
)

const FORM_ID = 'expense-form-new'

/**
 * Agregar gasto es una acción de la app, no de una pantalla: se abre desde el
 * botón junto al tab bar (o el + de la barra en regular) en cualquier tab.
 */
export function AddExpenseProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [open, setOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Atajo del manifest (long-press del icono → "Agregar gasto"): abre el form
  // al arrancar y limpia el param para que un back no lo reabra.
  useEffect(() => {
    if (!searchParams.has('nuevo')) return
    void importExpenseForm()
    setOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete('nuevo')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  // Precarga en idle tras el primer paint: sale del critical path pero llega
  // antes del primer tap. `import()` cachea, repetir es gratis.
  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') {
      const timer = window.setTimeout(() => void importExpenseForm(), 1200)
      return () => window.clearTimeout(timer)
    }
    const handle = window.requestIdleCallback(() => void importExpenseForm(), {
      timeout: 3000,
    })
    return () => window.cancelIdleCallback(handle)
  }, [])

  const api = useMemo(
    () => ({
      openAdd: () => {
        void importExpenseForm()
        setOpen(true)
      },
      warmAdd: () => void importExpenseForm(),
    }),
    [],
  )

  return (
    <AddExpenseContext.Provider value={api}>
      {children}
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="Nuevo gasto"
        trailing={<SheetConfirmButton label="Guardar gasto" form={FORM_ID} />}
      >
        <Suspense fallback={<ExpenseFormSkeleton />}>
          <ExpenseForm formId={FORM_ID} onSuccess={() => setOpen(false)} />
        </Suspense>
      </FormSheet>
    </AddExpenseContext.Provider>
  )
}
