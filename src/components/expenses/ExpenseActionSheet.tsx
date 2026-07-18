import type { ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseIcon } from '@/components/expenses/ExpenseIcon'
import { getExpenseLabel } from '@/lib/expense-display'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { ExpenseWithCategory } from '@/types/database'

interface ExpenseActionSheetProps {
  expense: ExpenseWithCategory
  onEdit: () => void
  onDelete: () => void
}

function ActionIconBox({
  children,
  tone,
  className,
}: Readonly<{
  children: ReactNode
  tone: 'primary' | 'destructive'
  className?: string
}>) {
  return (
    <span
      className={cn(
        'flex size-11 items-center justify-center rounded-lg bg-secondary ring-1',
        tone === 'primary' ? 'ring-primary/35' : 'ring-destructive/35',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ExpenseActionSheet({
  expense,
  onEdit,
  onDelete,
}: Readonly<ExpenseActionSheetProps>) {
  const title = getExpenseLabel(expense.description, expense.category?.name)

  return (
    <div className="px-1 pb-1 pt-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <ExpenseIcon
          description={expense.description}
          categoryName={expense.category?.name}
          categoryIcon={expense.category?.icon}
          categoryColor={expense.category?.color}
          size="xl"
        />
        <div className="w-full space-y-1">
          <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatCurrency(Number(expense.amount))}
          </p>
          <p className="truncate px-4 text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{expense.category?.name}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="pressable flex min-h-11 cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-border/70 bg-muted/25 px-3 py-4 transition-colors hover:bg-muted/40 active:bg-muted/50"
        >
          <ActionIconBox tone="primary">
            <Pencil className="size-5 text-primary" />
          </ActionIconBox>
          <span className="text-sm font-medium">Editar</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="pressable flex min-h-11 cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-4 text-destructive transition-colors hover:bg-destructive/15 active:bg-destructive/20"
        >
          <ActionIconBox tone="destructive">
            <Trash2 className="size-5" />
          </ActionIconBox>
          <span className="text-sm font-medium">Eliminar</span>
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
