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
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useMonth } from '@/contexts/MonthContext'
import {
  predictCategoryFromDescription,
  type CategoryPrediction,
} from '@/lib/predict-category'
import { cn } from '@/lib/utils'
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

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const { year, month } = useMonth()
  const { data: categories = [], isLoading } = useCategories()
  const { data: history = [] } = useExpenseHistory()
  const createExpense = useCreateExpense(year, month)
  const updateExpense = useUpdateExpense(year, month)
  const isEditing = Boolean(expense)
  const isDesktop = useIsDesktop()
  const originalDescription = expense?.description ?? ''
  const [categoryManual, setCategoryManual] = useState(isEditing)
  const [prediction, setPrediction] = useState<CategoryPrediction | null>(null)
  const skipNextPredictionRef = useRef(isEditing)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
        setValue('category_id', result.categoryId, { shouldValidate: true })
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
    setValue('category_id', id)
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
  const compact = !isDesktop
  const showPredictionHint = prediction && !categoryManual

  const categoryField = (
    <div className={cn(compact ? 'space-y-2' : 'space-y-3')}>
      <p className={cn('stat-label', compact && 'sr-only')}>Categoría</p>
      <ExpenseCategoryPicker
        categories={categories}
        value={categoryId}
        onChange={handleCategoryChange}
        compact={compact}
      />
      {showPredictionHint ? (
        <p className="flex items-center gap-1.5 text-xs text-primary/90">
          <Sparkles className="size-3 shrink-0" />
          <span>
            Sugerido: <span className="font-medium">{prediction.categoryName}</span>
          </span>
        </p>
      ) : null}
      {errors.category_id ? (
        <p className="text-xs text-destructive">{errors.category_id.message}</p>
      ) : null}
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(compact ? 'space-y-5' : 'space-y-6')}
    >
      <div className={cn(compact ? 'space-y-1' : 'space-y-2')}>
        <p className={cn('stat-label', compact && 'sr-only')}>Monto</p>
        <ExpenseAmountInput
          id="amount"
          compact={compact}
          hasError={Boolean(errors.amount)}
          autoFocus={!isEditing}
          aria-invalid={Boolean(errors.amount)}
          required
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount ? (
          <p className="text-center text-xs text-destructive">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className={cn('stat-label', compact && 'sr-only')}>Descripción</p>
        <ExpenseNoteInput
          id="description"
          compact={compact}
          hasError={Boolean(errors.description)}
          aria-invalid={Boolean(errors.description)}
          required
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      {categoryField}

      <div className="space-y-2">
        <p className={cn('stat-label', compact && 'sr-only')}>Fecha</p>
        <ExpenseDatePicker
          value={expenseDate}
          onChange={(date) => setValue('expense_date', date)}
          compact={compact}
        />
        {errors.expense_date ? (
          <p className="text-xs text-destructive">{errors.expense_date.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className={cn(
          'w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90',
          compact ? 'h-11' : 'h-10',
        )}
        disabled={isSaving}
      >
        {isSaving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar gasto'}
      </Button>
    </form>
  )
}
