import { useEffect, useRef, useState } from 'react'
import { onlineManager } from '@tanstack/react-query'
import { useForm, type FieldErrors } from 'react-hook-form'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ExpenseAmountInput } from '@/components/expenses/ExpenseAmountInput'
import { ExpenseCategoryPicker } from '@/components/expenses/ExpenseCategoryPicker'
import { ExpenseDatePicker } from '@/components/expenses/ExpenseDatePicker'
import { ExpenseNoteInput } from '@/components/expenses/ExpenseNoteInput'
import { ExpenseFormSkeleton } from '@/components/layout/skeletons'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseHistory } from '@/hooks/useExpenseHistory'
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses'
import { expenseResolver, type ExpenseFormValues } from '@/lib/expense-validation'
import { defaultExpenseDate } from '@/lib/format'
import { successFeedback } from '@/lib/haptics'
import { useMonth } from '@/contexts/MonthContext'
import {
  predictCategoryFromDescription,
  type CategoryPrediction,
} from '@/lib/predict-category'
import { cn } from '@/lib/utils'
import type { ExpenseWithCategory } from '@/types/database'

type FormValues = ExpenseFormValues

interface ExpenseFormProps {
  expense?: ExpenseWithCategory
  onSuccess?: () => void
}

export function ExpenseForm({ expense, onSuccess }: Readonly<ExpenseFormProps>) {
  const { year, month } = useMonth()
  const { data: categories = [], isLoading } = useCategories()
  const { data: history = [] } = useExpenseHistory()
  const { user } = useAuth()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const isEditing = Boolean(expense)
  const originalDescription = expense?.description ?? ''
  const [categoryManual, setCategoryManual] = useState(isEditing)
  const [prediction, setPrediction] = useState<CategoryPrediction | null>(null)
  const [shaking, setShaking] = useState(false)
  const skipNextPredictionRef = useRef(isEditing)
  // El botón ya no se deshabilita esperando al servidor: esto frena el doble
  // tap que entra antes de que el sheet termine de cerrarse
  const submittedRef = useRef(false)
  // Vuelta de "Guardar y agregar otro": remonta el monto limpio y con foco
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (!shaking) return
    const timer = window.setTimeout(() => setShaking(false), 450)
    return () => window.clearTimeout(timer)
  }, [shaking])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: expenseResolver,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      amount: expense?.amount ?? undefined,
      category_id: expense?.category_id ?? '',
      description: expense?.description ?? '',
      expense_date: expense?.expense_date ?? defaultExpenseDate(year, month),
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

  /*
    Sin await: el optimistic update ya pintó la fila, así que el sheet cierra
    al instante. Sin red la mutation queda pausada y persistida; antes esto
    esperaba la respuesta y el botón se quedaba en "Guardando…" para siempre.
    Si el servidor rechaza, el hook revierte la fila y avisa con un toast.
  */
  function onSubmit(values: FormValues, addAnother = false) {
    if (submittedRef.current) return
    submittedRef.current = true
    const online = onlineManager.isOnline()
    if (isEditing && expense) {
      updateExpense.mutate({ id: expense.id, ...values })
      toast.success(
        online ? 'Gasto actualizado' : 'Cambio guardado · se sincroniza al volver la conexión',
      )
    } else {
      if (!user) return
      createExpense.mutate({ ...values, id: crypto.randomUUID(), user_id: user.id })
      toast.success(
        online ? 'Gasto guardado' : 'Gasto guardado · se sincroniza al volver la conexión',
      )
    }
    successFeedback()

    /*
      Varios tickets seguidos: el form queda abierto, limpio, con el foco en el
      monto. Fecha y categoría se conservan — suelen repetirse — y la
      categoría se vuelve a sugerir con la próxima descripción.
    */
    if (addAnother) {
      reset({
        amount: Number.NaN,
        description: '',
        category_id: values.category_id,
        expense_date: values.expense_date,
      })
      setPrediction(null)
      setCategoryManual(false)
      setRound((value) => value + 1)
      submittedRef.current = false
      return
    }
    onSuccess?.()
  }

  /*
    Sacudida del bloque del monto cuando el envío falla por ahí — señala qué
    campo mirar antes de leer el texto. El apagado + rAF vuelve a montar la
    clase: sin eso el segundo intento no anima, porque la clase ya estaba
    puesta y el keyframe no se reinicia solo.
  */
  function handleInvalid(invalid: FieldErrors<FormValues>) {
    if (!invalid.amount) return
    setShaking(false)
    requestAnimationFrame(() => setShaking(true))
  }

  function handleCategoryChange(id: string) {
    setCategoryManual(true)
    setPrediction(null)
    setValue('category_id', id, { shouldValidate: false })
  }

  if (isLoading) {
    return <ExpenseFormSkeleton />
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Crea al menos una categoría antes de registrar gastos.
      </p>
    )
  }

  const showPredictionHint = prediction && !categoryManual

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values), handleInvalid)}
      // La validación la manda Zod, en español. Sin esto el navegador dispara
      // primero su propio globo ("Please fill out this field.", en el idioma
      // del browser) y tapa el mensaje y la sacudida del campo. Los `required`
      // se quedan: siguen exponiendo aria-required.
      noValidate
      className="flex w-full min-w-0 max-w-full flex-col gap-5 overflow-x-hidden"
    >
      <div className={cn('min-w-0 space-y-1.5', shaking && 'shake')}>
        <ExpenseAmountInput
          key={round}
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
          <p role="alert" className="notice-in text-center text-xs text-destructive">
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
            <p role="alert" className="notice-in text-xs text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="stat-label">Categoría</p>
            {/* La categoría se autodetecta sola: si el aviso entra animado, el
                salto del riel de chips se lee como consecuencia y no como bug */}
            {showPredictionHint ? (
              <p
                key={prediction.categoryId}
                className="notice-in flex items-center gap-1 text-[11px] text-primary/90"
              >
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
            <p role="alert" className="notice-in text-xs text-destructive">
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
            <p role="alert" className="notice-in text-xs text-destructive">
              {errors.expense_date.message}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full max-w-full shrink cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isEditing ? 'Actualizar' : 'Guardar gasto'}
      </Button>
      {isEditing ? null : (
        <Button
          type="button"
          variant="ghost"
          size="touch"
          className="-mt-3 w-full cursor-pointer text-primary"
          onClick={handleSubmit((values) => onSubmit(values, true), handleInvalid)}
        >
          Guardar y agregar otro
        </Button>
      )}
    </form>
  )
}
