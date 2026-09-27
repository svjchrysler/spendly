import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useMutationState } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
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
  ExpenseActionSheet,
  ExpenseRowActions,
} from '@/components/expenses/ExpenseActionSheet'
import { ExpenseIcon } from '@/components/expenses/ExpenseIcon'
import { ExpenseFormSkeleton } from '@/components/layout/skeletons'
import { getExpenseLabel } from '@/lib/expense-display'
import { formatCurrency, formatDayLabel } from '@/lib/format'
import { useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses'
import { useFreshItems } from '@/hooks/useFreshItems'
import { useLatchedWhile } from '@/hooks/useLatchedWhile'
import { useIsDesktop, useIsTouch } from '@/hooks/useMediaQuery'
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
  touch,
  swipeOpen,
  fresh = false,
  hint = false,
  pending = false,
  onSwipeOpenChange,
  onOpenActions,
  onEdit,
  onDelete,
}: Readonly<{
  expense: ExpenseWithCategory
  caption: string
  /** Puntero táctil: swipe + action sheet en vez de botones inline */
  touch: boolean
  swipeOpen: boolean
  /** Llegó después del primer render: se tinta un momento para ubicarlo */
  fresh?: boolean
  /** Pista única de swipe: la fila se asoma y vuelve */
  hint?: boolean
  /** Guardado sin red: la mutation está pausada esperando conexión */
  pending?: boolean
  onSwipeOpenChange: (open: boolean) => void
  onOpenActions: () => void
  onEdit: () => void
  onDelete: () => void
}>) {
  const { nodeRef, rowRef, swipeHandlers } = useSwipeActions({
    enabled: touch,
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
      subtitle={
        pending ? [caption, 'Sin sincronizar'].filter(Boolean).join(' · ') : caption
      }
      onPress={touch ? onOpenActions : undefined}
      trailing={
        <span className="flex items-center gap-0.5 sm:gap-1">
          <span className="font-ledger text-body font-semibold whitespace-nowrap tabular-nums">
            {formatCurrency(Number(expense.amount))}
          </span>
          {touch ? null : <ExpenseRowActions onEdit={onEdit} onDelete={onDelete} />}
        </span>
      }
      className={cn(!touch && 'sm:cursor-default', fresh && 'row-landed')}
    />
  )

  if (!touch) return row

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

/*
  El primer gasto de un día crea la sección entera: que suba a su lugar
  explica de dónde salió ese bloque nuevo. Se decide en el primer render de la
  sección y no cambia: sumar `.reveal` a un nodo ya pintado lo haría parpadear.
*/
function DaySection({ arrived, children }: Readonly<{ arrived: boolean; children: ReactNode }>) {
  const [reveal] = useState(arrived)
  return <div className={cn('list-section', reveal && 'reveal')}>{children}</div>
}

export function ExpenseList({
  expenses,
  showFab = false,
  compact = false,
  emptyCta,
}: Readonly<ExpenseListProps>) {
  const { monthKey } = useMonth()
  const deleteExpense = useDeleteExpense()
  const restoreExpense = useCreateExpense()
  // Ids con una mutation pausada por falta de red (alta o edición)
  const pendingIds = new Set(
    useMutationState({
      filters: { mutationKey: ['expenses'], predicate: (m) => m.state.isPaused },
      select: (m) => (m.state.variables as { id?: string } | undefined)?.id,
    }),
  )
  const [openAdd, setOpenAdd] = useState(false)
  const [editing, setEditing] = useState<ExpenseWithCategory | null>(null)
  const [actionExpense, setActionExpense] = useState<ExpenseWithCategory | null>(null)
  // Una sola fila abierta a la vez, como iOS
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null)
  const isDesktop = useIsDesktop()
  const touch = useIsTouch()
  const addAsDialog = useLatchedWhile(openAdd, isDesktop)
  const editAsDialog = useLatchedWhile(Boolean(editing), isDesktop)
  const reducedMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  // Filas que aparecieron después del primer render: el gasto que acabás de
  // guardar, o el que entró por realtime desde el otro dispositivo. `resetKey`
  // por mes — cambiar de mes trae otra lista entera, no llegadas.
  const freshIds = useFreshItems(
    expenses.map((expense) => expense.id),
    { resetKey: monthKey },
  )
  // Mes cuya lista ya está en pantalla: una sección que monte después es una
  // llegada (el primer gasto de un día nuevo), no parte de la carga inicial
  const [settledMonth, setSettledMonth] = useState<string | null>(null)
  useEffect(() => setSettledMonth(monthKey), [monthKey])
  const [hintRowId, setHintRowId] = useState<string | null>(null)
  const firstExpenseId = expenses[0]?.id

  /*
    El swipe-to-delete no tiene affordance visual: o se enseña o no existe.
    Una vez por instalación la primera fila se asoma y vuelve, mostrando la
    acción que hay debajo. Después nunca más — una pista que se repite es un
    tic, no una ayuda.
  */
  useEffect(() => {
    if (!touch || reducedMotion || !firstExpenseId) return
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
  }, [touch, reducedMotion, firstExpenseId])

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

  /*
    Borrar es inmediato y reversible, como en Mail: un swipe completo ya es la
    confirmación, y un diálogo encima era pedirla dos veces. "Deshacer"
    re-inserta la misma fila (mismo id y created_at, vuelve a su lugar). Las
    dos mutations comparten scope, así que el alta espera al borrado aunque
    no haya red.
  */
  function handleDelete(expense: ExpenseWithCategory) {
    setActionExpense(null)
    deleteExpense.mutate(expense.id)
    warnFeedback()
    toast.success('Gasto eliminado', {
      description: `${getExpenseLabel(expense.description, expense.category?.name)} · ${formatCurrency(Number(expense.amount))}`,
      action: {
        label: 'Deshacer',
        onClick: () =>
          restoreExpense.mutate({
            id: expense.id,
            user_id: expense.user_id,
            category_id: expense.category_id,
            amount: Number(expense.amount),
            description: expense.description,
            expense_date: expense.expense_date,
            created_at: expense.created_at,
          }),
      },
    })
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

    if (addAsDialog) {
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
              touch={touch}
              fresh={freshIds.has(expense.id)}
              hint={hintRowId === expense.id}
              pending={pendingIds.has(expense.id)}
              swipeOpen={swipeOpenId === expense.id}
              onSwipeOpenChange={(open) => setSwipeOpenId(open ? expense.id : null)}
              onOpenActions={() => openActions(expense)}
              onEdit={() => openEdit(expense)}
              onDelete={() => handleDelete(expense)}
            />
          ))}
        </div>
      ) : null}

      {!compact && expenses.length > 0 ? (
        <List>
            {grouped.map(({ date, items, subtotal }) => (
              <DaySection key={date} arrived={settledMonth === monthKey}>
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
                      touch={touch}
                      fresh={freshIds.has(expense.id)}
                      hint={hintRowId === expense.id}
                      pending={pendingIds.has(expense.id)}
                      swipeOpen={swipeOpenId === expense.id}
                      onSwipeOpenChange={(open) =>
                        setSwipeOpenId(open ? expense.id : null)
                      }
                      onOpenActions={() => openActions(expense)}
                      onEdit={() => openEdit(expense)}
                      onDelete={() => handleDelete(expense)}
                    />
                  ))}
                </ListSection>
              </DaySection>
            ))}
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
              onDelete={() => handleDelete(actionExpense)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {editAsDialog ? (
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

    </>
  )
}
