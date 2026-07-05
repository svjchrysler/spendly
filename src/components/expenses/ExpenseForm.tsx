import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses'
import { useMonth } from '@/contexts/MonthContext'
import type { ExpenseWithCategory } from '@/types/database'

const schema = z.object({
  amount: z
    .number({ error: 'El monto debe ser un número' })
    .positive('El monto debe ser mayor a 0'),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().optional(),
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
  const createExpense = useCreateExpense(year, month)
  const updateExpense = useUpdateExpense(year, month)
  const isEditing = Boolean(expense)

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

  useEffect(() => {
    if (!categoryId && categories[0]) {
      setValue('category_id', categories[0].id)
    }
  }, [categories, categoryId, setValue])

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount ? (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            if (value) setValue('category_id', value)
          }}
        >
          <SelectTrigger id="category" className="w-full cursor-pointer">
            <SelectValue placeholder="Selecciona categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id ? (
          <p className="text-sm text-destructive">{errors.category_id.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Ej. Supermercado, gasolina..."
          rows={2}
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense_date">Fecha</Label>
        <Input id="expense_date" type="date" {...register('expense_date')} />
        {errors.expense_date ? (
          <p className="text-sm text-destructive">{errors.expense_date.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer transition-colors duration-200"
        disabled={isSubmitting || createExpense.isPending || updateExpense.isPending}
      >
        {isSubmitting || createExpense.isPending || updateExpense.isPending
          ? 'Guardando...'
          : isEditing
            ? 'Actualizar gasto'
            : 'Guardar gasto'}
      </Button>
    </form>
  )
}
