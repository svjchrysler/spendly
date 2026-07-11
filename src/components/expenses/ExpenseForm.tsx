import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ExpenseAmountInput } from '@/components/expenses/ExpenseAmountInput'
import { ExpenseCategoryPicker } from '@/components/expenses/ExpenseCategoryPicker'
import { ExpenseDatePicker } from '@/components/expenses/ExpenseDatePicker'
import { ExpenseNoteInput } from '@/components/expenses/ExpenseNoteInput'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseHistory } from '@/hooks/useExpenseHistory'
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses'
import { useMonth } from '@/contexts/MonthContext'
import {
  predictCategoryFromDescription,
  type CategoryPrediction,
} from '@/lib/predict-category'
import type { ExpenseWithCategory } from '@/types/database'

const schema = z.object({
  amount: z
    .number({ error: 'El monto es obligatorio' })
    .refine((value) => !Number.isNaN(value), 'El monto es obligatorio')
    .positive('El monto debe ser mayor a 0'),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  expense_date: z.string().min(1, 'La fecha es obligatoria'),
})

type FormValues = z.infer<typeof schema>

interface ExpenseFormProps {
  expense?: ExpenseWithCategory
  onSuccess?: () => void
}

export function ExpenseForm({ expense, onSuccess }: Readonly<ExpenseFormProps>) {
  const { year, month } = useMonth()
  const { data: categories = [], isLoading } = useCategories()
  const { data: history = [] } = useExpenseHistory()
  const createExpense = useCreateExpense(year, month)
  const updateExpense = useUpdateExpense(year, month)
  const isEditing = Boolean(expense)
  const originalDescription = expense?.description ?? ''
  const [categoryManual, setCategoryManual] = useState(isEditing)
  const [prediction, setPrediction] = useState<CategoryPrediction | null>(null)
  const skipNextPredictionRef = useRef(isEditing)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      amount: expense?.amount ?? undefined,
      category_id: expense?.category_id ?? '',
      description: expense?.description ?? '',
      expense_date:
        expense?.expense_date ?? new Date().toISOString().split('T')[0],
    },
  })

  const categoryId = watch('category_id')
  const expenseDate = watch('expense_date')
  const description = watch('description')
  const amount = watch('amount')

  useEffect(() => {
    if (!categoryId && categories[0]) {
      setValue('category_id', categories[0].id)
    }
  }, [categories, categoryId, setValue])

  useEffect(() => {
    const trimmed = description?.trim() ?? ''

    if (!trimmed) {
      setPrediction(null)
      setCategoryManual(false)
      skipNextPredictionRef.current = false
      return
    }

    if (skipNextPredictionRef.current) {
      if (trimmed !== originalDescription.trim()) {
        skipNextPredictionRef.current = false
        setCategoryManual(false)
      } else {
        return
      }
    }

    if (categoryManual) return

    const timer = window.setTimeout(() => {
      const result = predictCategoryFromDescription(trimmed, history, categories)
      setPrediction(result)

      if (result) {
        setValue('category_id', result.categoryId, { shouldValidate: false })
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [
    description,
    history,
    categories,
    categoryManual,
    originalDescription,
    setValue,
  ])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && expense) {
        await updateExpense.mutateAsync({ id: expense.id, ...values })
        toast.success('Gasto actualizado')
      } else {
        await createExpense.mutateAsync(values)
        toast.success('Gasto guardado')
      }
      onSuccess?.()
    } catch {
      toast.error('No se pudo guardar el gasto')
    }
  }

  function handleCategoryChange(id: string) {
    setCategoryManual(true)
    setPrediction(null)
    setValue('category_id', id, { shouldValidate: false })
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando categorías...</p>
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Crea al menos una categoría antes de registrar gastos.
      </p>
    )
  }

  const isSaving = isSubmitting || createExpense.isPending || updateExpense.isPending
  const showPredictionHint = prediction && !categoryManual

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full min-w-0 max-w-full flex-col gap-5 overflow-x-hidden"
    >
      <div className="min-w-0 space-y-1.5">
        <ExpenseAmountInput
          id="amount"
          hasError={Boolean(errors.amount)}
          autoFocus={!isEditing}
          aria-invalid={Boolean(errors.amount)}
          required
          value={amount}
          onChange={(next) =>
            setValue('amount', next ?? Number.NaN, { shouldValidate: false })
          }
          onBlur={() => {
            void trigger('amount')
          }}
        />
        {errors.amount ? (
          <p role="alert" className="text-center text-xs text-destructive">
            {errors.amount.message}
          </p>
        ) : null}
      </div>

      <div className="min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <label htmlFor="description" className="stat-label">
            Descripción
          </label>
          <ExpenseNoteInput
            id="description"
            hasError={Boolean(errors.description)}
            aria-invalid={Boolean(errors.description)}
            required
            {...register('description')}
          />
          {errors.description ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="stat-label">Categoría</p>
            {showPredictionHint ? (
              <p className="flex items-center gap-1 text-[11px] text-primary/90">
                <Sparkles className="size-3 shrink-0" aria-hidden />
                Sugerido
              </p>
            ) : null}
          </div>
          <ExpenseCategoryPicker
            categories={categories}
            value={categoryId}
            onChange={handleCategoryChange}
          />
          {errors.category_id ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.category_id.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-2">
          <p className="stat-label">Fecha</p>
          <ExpenseDatePicker
            value={expenseDate}
            onChange={(date) => setValue('expense_date', date)}
          />
          {errors.expense_date ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.expense_date.message}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full max-w-full shrink cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isSaving}
      >
        {isSaving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar gasto'}
      </Button>
    </form>
  )
}
