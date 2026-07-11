import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ExpenseActionSheet,
  ExpenseRowActions,
} from '@/components/expenses/ExpenseActionSheet'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { ExpenseIcon } from '@/components/expenses/ExpenseIcon'
import { getExpenseLabel } from '@/lib/expense-display'
import { formatCurrency, formatDayLabel } from '@/lib/format'
import { useDeleteExpense } from '@/hooks/useExpenses'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useMonth } from '@/contexts/MonthContext'
import type { ExpenseWithCategory } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
  showFab?: boolean
}

export function ExpenseList({ expenses, showFab = false }: Readonly<ExpenseListProps>) {
  const { year, month } = useMonth()
  const deleteExpense = useDeleteExpense(year, month)
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState<ExpenseWithCategory | null>(null)
  const [deleting, setDeleting] = useState<ExpenseWithCategory | null>(null)
  const [actionExpense, setActionExpense] = useState<ExpenseWithCategory | null>(null)
  const isDesktop = useIsDesktop()

  const grouped = useMemo(() => {
    const map = new Map<string, ExpenseWithCategory[]>()
    for (const expense of expenses) {
      const key = expense.expense_date
      const list = map.get(key) ?? []
      list.push(expense)
      map.set(key, list)
    }
    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      items,
      subtotal: items.reduce((sum, item) => sum + Number(item.amount), 0),
    }))
  }, [expenses])

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteExpense.mutateAsync(deleting.id)
      toast.success('Gasto eliminado')
      setDeleting(null)
    } catch {
      toast.error('No se pudo eliminar el gasto')
    }
  }

  function openEdit(expense: ExpenseWithCategory) {
    setActionExpense(null)
    setEditing(expense)
  }

  function openDelete(expense: ExpenseWithCategory) {
    setActionExpense(null)
    setDeleting(expense)
  }

  const addForm = (
    <ExpenseForm
      onSuccess={() => {
        setOpenAdd(false)
      }}
    />
  )

  const editForm = editing ? (
    <ExpenseForm
      expense={editing}
      onSuccess={() => setEditing(null)}
    />
  ) : null

  let addExpenseUi = null
  if (showFab) {
    if (isDesktop) {
      addExpenseUi = (
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <Button
            className="fab"
            onClick={() => setOpenAdd(true)}
            aria-label="Agregar gasto"
          >
            <Plus className="size-6" />
          </Button>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle>Nuevo gasto</DialogTitle>
            </DialogHeader>
            {addForm}
          </DialogContent>
        </Dialog>
      )
    } else {
      addExpenseUi = (
        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
          <Button
            className="fab"
            aria-label="Agregar gasto"
            onClick={() => setOpenAdd(true)}
          >
            <Plus className="size-6" />
          </Button>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
          >
            <SheetHeader className="pb-3">
              <SheetTitle>Nuevo gasto</SheetTitle>
            </SheetHeader>
            {addForm}
          </SheetContent>
        </Sheet>
      )
    }
  }

  return (
    <>
      {addExpenseUi}

      <div className="space-y-5">
        <AnimatePresence mode="popLayout">
          {grouped.map(({ date, items, subtotal }, groupIndex) => (
            <motion.section
              key={date}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: 0.28,
                delay: Math.min(groupIndex * 0.04, 0.16),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden"
            >
              <div className="mb-1 flex items-center justify-between pb-2">
                <h3 className="stat-label capitalize">{formatDayLabel(date)}</h3>
                <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground/90">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="divide-y divide-border/25">
                {items.map((expense) => {
                  return (
                    <motion.div
                      key={expense.id}
                      layout
                      role={isDesktop ? undefined : 'button'}
                      tabIndex={isDesktop ? undefined : 0}
                      onClick={
                        isDesktop
                          ? undefined
                          : () => setActionExpense(expense)
                      }
                      onKeyDown={
                        isDesktop
                          ? undefined
                          : (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setActionExpense(expense)
                              }
                            }
                      }
                      className={cn(
                        'row-hover group flex min-w-0 items-center justify-between gap-3 py-3 sm:cursor-default',
                        !isDesktop && 'cursor-pointer',
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <ExpenseIcon
                          description={expense.description}
                          categoryName={expense.category?.name}
                          categoryIcon={expense.category?.icon}
                          categoryColor={expense.category?.color}
                          size="sm"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-[15px] font-medium leading-tight tracking-tight">
                            {getExpenseLabel(expense.description, expense.category?.name)}
                          </p>
                          <p className="truncate text-xs leading-tight text-muted-foreground">
                            {expense.category?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                        <span className="text-[15px] font-semibold whitespace-nowrap tabular-nums tracking-tight sm:text-base">
                          {formatCurrency(Number(expense.amount))}
                        </span>
                        {isDesktop ? (
                          <ExpenseRowActions
                            onEdit={() => openEdit(expense)}
                            onDelete={() => openDelete(expense)}
                          />
                        ) : null}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      <Sheet
        open={Boolean(actionExpense)}
        onOpenChange={(open) => !open && setActionExpense(null)}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="gap-0 rounded-t-2xl border-t border-border/80 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Acciones del gasto</SheetTitle>
          </SheetHeader>
          {actionExpense ? (
            <ExpenseActionSheet
              expense={actionExpense}
              onEdit={() => openEdit(actionExpense)}
              onDelete={() => openDelete(actionExpense)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {isDesktop ? (
        <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle>Editar gasto</DialogTitle>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
          >
            <SheetHeader className="pb-3">
              <SheetTitle>Editar gasto</SheetTitle>
            </SheetHeader>
            {editForm}
          </SheetContent>
        </Sheet>
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `Se eliminará "${getExpenseLabel(deleting.description, deleting.category?.name)}" por ${formatCurrency(Number(deleting.amount))}. Esta acción no se puede deshacer.`
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
