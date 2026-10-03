import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseIcon } from '@/components/expenses/ExpenseIcon'
import { getExpenseLabel } from '@/lib/expense-display'
import { formatCurrency, formatDayLabel } from '@/lib/format'
import type { ExpenseWithCategory } from '@/types/database'

interface ExpenseActionSheetProps {
  expense: ExpenseWithCategory
  onEdit: () => void
  onDelete: () => void
}

/**
 * Detalle del gasto + acciones, como el action sheet de iOS 26/27: el objeto
 * arriba y las acciones en un grupo de celdas, con la destructiva en rojo.
 */
export function ExpenseActionSheet({
  expense,
  onEdit,
  onDelete,
}: Readonly<ExpenseActionSheetProps>) {
  const title = getExpenseLabel(expense.description, expense.category?.name)
  const meta = [expense.category?.name, formatDayLabel(expense.expense_date)]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="pt-3">
      <div className="flex flex-col items-center gap-2 px-2 pb-5 text-center">
        <ExpenseIcon
          description={expense.description}
          categoryName={expense.category?.name}
          categoryIcon={expense.category?.icon}
          categoryColor={expense.category?.color}
          size="xl"
        />
        <p className="mt-1 font-ledger text-[2.25rem] leading-none font-bold text-label">
          {formatCurrency(Number(expense.amount))}
        </p>
        <div className="w-full min-w-0">
          <p className="truncate text-headline text-label">{title}</p>
          <p className="truncate text-subhead text-label-secondary">{meta}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-sheet-cell">
        <button
          type="button"
          onClick={onEdit}
          className="list-row list-row--tappable"
          style={{ '--row-inset': '3.25rem' } as React.CSSProperties}
        >
          <Pencil className="size-5 shrink-0 text-primary" aria-hidden />
          <span className="flex-1 text-body text-label">Editar gasto</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="list-row list-row--tappable"
          style={{ '--row-inset': '3.25rem' } as React.CSSProperties}
        >
          <Trash2 className="size-5 shrink-0 text-destructive" aria-hidden />
          <span className="flex-1 text-body text-destructive">Eliminar gasto</span>
        </button>
      </div>
    </div>
  )
}

interface ExpenseRowActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export function ExpenseRowActions({ onEdit, onDelete }: Readonly<ExpenseRowActionsProps>) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-9 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        aria-label="Editar gasto"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-9 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="Eliminar gasto"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
