import type { FieldErrors, Resolver, ResolverResult } from 'react-hook-form'

export type ExpenseFormValues = {
  amount: number
  category_id: string
  description: string
  expense_date: string
}

/*
  Resolver propio en vez de zod + @hookform/resolvers: son cuatro reglas y la
  librería pesaba más que todo el resto del form. Mismos mensajes y mismo
  contrato (errores → no hay values; ok → values con la descripción recortada).
*/
export function validateExpense(values: ExpenseFormValues): ResolverResult<ExpenseFormValues> {
  const errors: FieldErrors<ExpenseFormValues> = {}

  if (typeof values.amount !== 'number' || Number.isNaN(values.amount)) {
    errors.amount = { type: 'required', message: 'El monto es obligatorio' }
  } else if (values.amount <= 0) {
    errors.amount = { type: 'min', message: 'El monto debe ser mayor a 0' }
  }
  if (!values.category_id) {
    errors.category_id = { type: 'required', message: 'Selecciona una categoría' }
  }
  const description = values.description?.trim() ?? ''
  if (!description) {
    errors.description = { type: 'required', message: 'La descripción es obligatoria' }
  }
  if (!values.expense_date) {
    errors.expense_date = { type: 'required', message: 'La fecha es obligatoria' }
  }

  return Object.keys(errors).length > 0
    ? { values: {}, errors }
    : { values: { ...values, description }, errors: {} }
}

export const expenseResolver: Resolver<ExpenseFormValues> = async (values) =>
  validateExpense(values)
