import { describe, expect, it } from 'vitest'
import type { FieldErrors } from 'react-hook-form'
import { validateExpense, type ExpenseFormValues } from '@/lib/expense-validation'

const errorsOf = (values: ExpenseFormValues) =>
  validateExpense(values).errors as FieldErrors<ExpenseFormValues>

const valid = {
  amount: 25.5,
  category_id: 'cat',
  description: '  Almuerzo ',
  expense_date: '2026-09-27',
}

describe('validateExpense', () => {
  it('passes a valid expense and trims the description', () => {
    const result = validateExpense(valid)
    expect(result.errors).toEqual({})
    expect(result.values).toEqual({ ...valid, description: 'Almuerzo' })
  })

  it('reports each invalid field in Spanish', () => {
    const errors = errorsOf({
      amount: Number.NaN,
      category_id: '',
      description: '   ',
      expense_date: '',
    })
    expect(errors.amount?.message).toBe('El monto es obligatorio')
    expect(errors.category_id?.message).toBe('Selecciona una categoría')
    expect(errors.description?.message).toBe('La descripción es obligatoria')
    expect(errors.expense_date?.message).toBe('La fecha es obligatoria')
  })

  it('rejects zero and negative amounts', () => {
    expect(errorsOf({ ...valid, amount: 0 }).amount?.message).toBe(
      'El monto debe ser mayor a 0',
    )
  })
})
