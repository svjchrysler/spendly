import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List, ListRow, ListSection } from '@/components/ui/list'
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
import { ExpenseIcon } from '@/components/expenses/ExpenseIcon'
import { ExpenseFormSkeleton } from '@/components/layout/skeletons'
import { getExpenseLabel } from '@/lib/expense-display'
import { formatCurrency, formatDayLabel } from '@/lib/format'
import { useDeleteExpense } from '@/hooks/useExpenses'
import { useFreshItems } from '@/hooks/useFreshItems'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSwipeActions } from '@/hooks/useSwipeActions'
import { tapFeedback, warnFeedback } from '@/lib/haptics'
import { useMonth } from '@/contexts/MonthContext'
import type { ExpenseWithCategory } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// react-hook-form + zod viven solo acá: fuera del chunk inicial de Resumen/Gastos.
// Se precalienta al hover/press del FAB, así el sheet abre con el form ya listo.
const importExpenseForm = () => import('@/components/expenses/ExpenseForm')
const ExpenseForm = lazy(() =>
  importExpenseForm().then((module) => ({ default: module.ExpenseForm })),
)

/** Una sola vez por instalación — ver el efecto de la pista de swipe */
const SWIPE_HINT_KEY = 'spendly-swipe-hint'
/** Igual que el keyframe `swipe-hint` de index.css */
const SWIPE_HINT_MS = 1800

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
  showFab?: boolean
  /** Filas planas sin headers de fecha (Resumen); la fecha va en el caption. */
  compact?: boolean
  /** Texto del CTA cuando no hay gastos (abre el form de nuevo gasto). */
  emptyCta?: string
}

function ExpenseRow({
  expense,
  caption,
  isDesktop,
  swipeOpen,
  fresh = false,
  hint = false,
  onSwipeOpenChange,
  onOpenActions,
  onEdit,
  onDelete,
}: Readonly<{
  expense: ExpenseWithCategory
  caption: string
  isDesktop: boolean
  swipeOpen: boolean
  /** Llegó después del primer render: se tinta un momento para ubicarlo */
  fresh?: boolean
  /** Pista única de swipe: la fila se asoma y vuelve */
  hint?: boolean
  onSwipeOpenChange: (open: boolean) => void
  onOpenActions: () => void
  onEdit: () => void
  onDelete: () => void
}>) {
  const { nodeRef, rowRef, swipeHandlers } = useSwipeActions({
    enabled: !isDesktop,
    isOpen: swipeOpen,
    onOpenChange: onSwipeOpenChange,
    onCommit: onDelete,
  })

  const row = (
    <ListRow
      leading={
        <ExpenseIcon
          description={expense.description}
          categoryName={expense.category?.name}
          categoryIcon={expense.category?.icon}
          categoryColor={expense.category?.color}
          size="sm"
        />
      }
      title={getExpenseLabel(expense.description, expense.category?.name)}
      subtitle={caption}
      onPress={isDesktop ? undefined : onOpenActions}
      trailing={
        <span className="flex items-center gap-0.5 sm:gap-1">
          <span className="font-ledger text-body font-semibold whitespace-nowrap tabular-nums">
            {formatCurrency(Number(expense.amount))}
          </span>
          {isDesktop ? <ExpenseRowActions onEdit={onEdit} onDelete={onDelete} /> : null}
        </span>
      }
      className={cn(isDesktop && 'sm:cursor-default', fresh && 'row-landed')}
    />
  )

  if (isDesktop) return row

  return (
    <div ref={rowRef} className="swipe-row" {...swipeHandlers}>
      {/* Botón real detrás: el swipe nunca es el único camino a la acción */}
      <div className="swipe-row__actions" aria-hidden={!swipeOpen}>
        <button
          type="button"
          className="swipe-row__action"
          tabIndex={swipeOpen ? 0 : -1}
          onClick={onDelete}
        >
          <Trash2 className="size-5" aria-hidden />
          Eliminar
        </button>
      </div>
      <div ref={nodeRef} className="swipe-row__content" data-hint={hint ? 'true' : undefined}>
        {row}
      </div>
    </div>
  )
}

export function ExpenseList({
  expenses,
  showFab = false,
  compact = false,
  emptyCta,
}: Readonly<ExpenseListProps>) {
  const { year, month, monthKey } = useMonth()
  const deleteExpense = useDeleteExpense(year, month)
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState<ExpenseWithCategory | null>(null)
  const [deleting, setDeleting] = useState<ExpenseWithCategory | null>(null)
  const [actionExpense, setActionExpense] = useState<ExpenseWithCategory | null>(null)
  // Una sola fila abierta a la vez, como iOS
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null)
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  // Filas que aparecieron después del primer render: el gasto que acabás de
  // guardar, o el que entró por realtime desde el otro dispositivo. `resetKey`
  // por mes — cambiar de mes trae otra lista entera, no llegadas.
  const freshIds = useFreshItems(
    expenses.map((expense) => expense.id),
    { resetKey: monthKey },
  )
  const [hintRowId, setHintRowId] = useState<string | null>(null)
  const firstExpenseId = expenses[0]?.id

  /*
    El swipe-to-delete no tiene affordance visual: o se enseña o no existe.
    Una vez por instalación la primera fila se asoma y vuelve, mostrando la
    acción que hay debajo. Después nunca más — una pista que se repite es un
    tic, no una ayuda.
  */
  useEffect(() => {
    if (isDesktop || reducedMotion || !firstExpenseId) return
    if (localStorage.getItem(SWIPE_HINT_KEY)) return

    const show = window.setTimeout(() => {
      localStorage.setItem(SWIPE_HINT_KEY, '1')
      setHintRowId(firstExpenseId)
    }, 900)
    const hide = window.setTimeout(() => setHintRowId(null), 900 + SWIPE_HINT_MS)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [isDesktop, reducedMotion, firstExpenseId])

  // Atajo del manifest (long-press del icono → "Agregar gasto"): abre el form
  // al arrancar y limpia el param para que un back no lo reabra.
  useEffect(() => {
    if (!showFab || !searchParams.has('nuevo')) return
    void importExpenseForm()
    setOpenAdd(true)
    const next = new URLSearchParams(searchParams)
    next.delete('nuevo')
    setSearchParams(next, { replace: true })
  }, [showFab, searchParams, setSearchParams])

  // Precarga el form en idle tras el primer paint: sale del critical path del
  // Resumen pero llega antes del primer tap. `import()` cachea, repetir es gratis.
  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') {
      const timer = window.setTimeout(() => void importExpenseForm(), 1200)
      return () => window.clearTimeout(timer)
    }
    const handle = window.requestIdleCallback(() => void importExpenseForm(), {
      timeout: 3000,
    })
    return () => window.cancelIdleCallback(handle)
  }, [])

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
      warnFeedback()
      toast.success('Gasto eliminado')
      setDeleting(null)
    } catch {
      toast.error('No se pudo eliminar el gasto')
    }
  }

  function warmForm() {
    void importExpenseForm()
  }

  function openActions(expense: ExpenseWithCategory) {
    warmForm()
    setActionExpense(expense)
  }

  function openEdit(expense: ExpenseWithCategory) {
    setActionExpense(null)
    setEditing(expense)
  }

  function openDelete(expense: ExpenseWithCategory) {
    setActionExpense(null)
    setDeleting(expense)
  }

  const emptyState =
    expenses.length === 0 && emptyCta ? (
      <div
        className={cn(
          'reveal flex flex-col items-start gap-3 py-8',
          compact && 'flex-1 justify-center',
        )}
      >
        <p className="text-callout text-label-secondary">
          Sin movimientos este mes. Tu recibo está en blanco.
        </p>
        <Button
          type="button"
          variant="tinted"
          size="touch"
          className="cursor-pointer rounded-full"
          onClick={() => setOpenAdd(true)}
        >
          <Plus className="size-4" aria-hidden />
          {emptyCta}
        </Button>
      </div>
    ) : null

  const addForm = (
    <Suspense fallback={<ExpenseFormSkeleton />}>
      <ExpenseForm
        onSuccess={() => {
          setOpenAdd(false)
        }}
      />
    </Suspense>
  )

  const editForm = editing ? (
    <Suspense fallback={<ExpenseFormSkeleton />}>
      <ExpenseForm expense={editing} onSuccess={() => setEditing(null)} />
    </Suspense>
  ) : null

  let addExpenseUi = null
  if (showFab) {
    // Portal: PageEnter's transform/filter otherwise traps position:fixed
    const fab = createPortal(
      <Button
        type="button"
        className="fab"
        onClick={() => {
          tapFeedback()
          setOpenAdd(true)
        }}
        onPointerEnter={warmForm}
        onFocus={warmForm}
        aria-label="Agregar gasto"
      >
        <Plus className="size-6" />
      </Button>,
      document.body,
    )

    if (isDesktop) {
      addExpenseUi = (
        <>
          {fab}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
              <DialogHeader className="pr-8">
                <DialogTitle>Nuevo gasto</DialogTitle>
              </DialogHeader>
              {addForm}
            </DialogContent>
          </Dialog>
        </>
      )
    } else {
      addExpenseUi = (
        <>
          {fab}
          <Sheet open={openAdd} onOpenChange={setOpenAdd}>
            <SheetContent
              side="bottom"
              onOpenChange={setOpenAdd}
              className="gap-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1"
            >
              <SheetHeader className="pb-3">
                <SheetTitle>Nuevo gasto</SheetTitle>
              </SheetHeader>
              {addForm}
            </SheetContent>
          </Sheet>
        </>
      )
    }
  }

  return (
    <>
      {addExpenseUi}

      {emptyState}

      {compact && expenses.length > 0 ? (
        <div className="list-group">
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              caption={`${formatDayLabel(expense.expense_date)}${expense.category?.name ? ` · ${expense.category.name}` : ''}`}
              isDesktop={isDesktop}
              fresh={freshIds.has(expense.id)}
              hint={hintRowId === expense.id}
              swipeOpen={swipeOpenId === expense.id}
              onSwipeOpenChange={(open) => setSwipeOpenId(open ? expense.id : null)}
              onOpenActions={() => openActions(expense)}
              onEdit={() => openEdit(expense)}
              onDelete={() => openDelete(expense)}
            />
          ))}
        </div>
      ) : null}

      {!compact && expenses.length > 0 ? (
        <List>
          <AnimatePresence mode="popLayout">
            {grouped.map(({ date, items, subtotal }) => (
              <motion.div
                key={date}
                // El primer gasto de un día crea la sección entera: que suba a
                // su lugar explica de dónde salió ese bloque nuevo
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="list-section"
              >
                {/*
                  El header ya no es sticky: las listas agrupadas de iOS no
                  pegan sus headers, eso es de las listas `plain`. Eso libera
                  el transform del swipe, que antes rompía el sticky.
                */}
                <ListSection
                  header={formatDayLabel(date)}
                  headerTrailing={
                    <span className="font-ledger text-footnote font-semibold tabular-nums text-label-secondary">
                      {formatCurrency(subtotal)}
                    </span>
                  }
                >
                  {items.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      caption={expense.category?.name ?? ''}
                      isDesktop={isDesktop}
                      fresh={freshIds.has(expense.id)}
                      hint={hintRowId === expense.id}
                      swipeOpen={swipeOpenId === expense.id}
                      onSwipeOpenChange={(open) =>
                        setSwipeOpenId(open ? expense.id : null)
                      }
                      onOpenActions={() => openActions(expense)}
                      onEdit={() => openEdit(expense)}
                      onDelete={() => openDelete(expense)}
                    />
                  ))}
                </ListSection>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      ) : null}

      <Sheet
        open={Boolean(actionExpense)}
        onOpenChange={(open) => !open && setActionExpense(null)}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onOpenChange={() => setActionExpense(null)}
          className="gap-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1"
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
            onOpenChange={() => setEditing(null)}
            className="gap-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1"
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
