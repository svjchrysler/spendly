import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { getCategoryIcon } from '@/lib/category-icons'
import { formatCurrency, formatDayLabel } from '@/lib/format'
import { useDeleteExpense } from '@/hooks/useExpenses'
import { useMonth } from '@/contexts/MonthContext'
import type { ExpenseWithCategory } from '@/types/database'
import { toast } from 'sonner'

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
  showFab?: boolean
}

export function ExpenseList({ expenses, showFab = false }: ExpenseListProps) {
  const { year, month } = useMonth()
  const deleteExpense = useDeleteExpense(year, month)
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState<ExpenseWithCategory | null>(null)
  const [deleting, setDeleting] = useState<ExpenseWithCategory | null>(null)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, ExpenseWithCategory[]>()
    for (const expense of expenses) {
      const key = expense.expense_date
      const list = map.get(key) ?? []
      list.push(expense)
      map.set(key, list)
    }
    return Array.from(map.entries())
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

  const addForm = (
    <ExpenseForm
      onSuccess={() => {
        setOpenAdd(false)
      }}
    />
  )

  return (
    <>
      {showFab ? (
        isDesktop ? (
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <Button
              className="fixed bottom-24 right-4 z-40 size-14 cursor-pointer rounded-full shadow-lg lg:bottom-8 lg:right-8"
              onClick={() => setOpenAdd(true)}
              aria-label="Agregar gasto"
            >
              <Plus className="size-6" />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo gasto</DialogTitle>
              </DialogHeader>
              {addForm}
            </DialogContent>
          </Dialog>
        ) : (
          <Sheet open={openAdd} onOpenChange={setOpenAdd}>
            <Button
              className="fixed bottom-24 right-4 z-40 size-14 cursor-pointer rounded-full shadow-lg"
              aria-label="Agregar gasto"
              onClick={() => setOpenAdd(true)}
            >
              <Plus className="size-6" />
            </Button>
            <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Nuevo gasto</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{addForm}</div>
            </SheetContent>
          </Sheet>
        )
      ) : null}

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {grouped.map(([date, items]) => (
            <motion.section
              key={date}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold capitalize text-muted-foreground">
                {formatDayLabel(date)}
              </h3>
              <div className="space-y-2">
                {items.map((expense) => {
                  const Icon = getCategoryIcon(expense.category?.icon ?? 'receipt')
                  return (
                    <motion.div
                      key={expense.id}
                      layout
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-colors duration-200 hover:bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${expense.category?.color ?? '#3B82F6'}22`,
                          }}
                        >
                          <Icon
                            className="size-4"
                            style={{ color: expense.category?.color ?? '#3B82F6' }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {expense.description || expense.category?.name || 'Gasto'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(Number(expense.amount))}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg hover:bg-muted"
                          aria-label="Opciones del gasto"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setEditing(expense)}
                            >
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive"
                              onClick={() => setDeleting(expense)}
                            >
                              <Trash2 className="size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar gasto</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ExpenseForm
              expense={editing}
              onSuccess={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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
