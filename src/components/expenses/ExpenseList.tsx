import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMutationState } from '@tanstack/react-query'
import { Plus, ReceiptText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormSheet, SheetConfirmButton } from '@/components/ui/form-sheet'
import { List, ListRow, ListSection } from '@/components/ui/list'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAddExpense } from '@/components/expenses/add-expense-context'
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
import { useIsTouch } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSwipeActions } from '@/hooks/useSwipeActions'
import { warnFeedback } from '@/lib/haptics'
import { useMonth } from '@/contexts/MonthContext'
import type { ExpenseWithCategory } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mismo chunk que el alta (AddExpenseProvider), que ya lo precarga en idle
const importExpenseForm = () => import('@/components/expenses/ExpenseForm')
const ExpenseForm = lazy(() =>
  importExpenseForm().then((module) => ({ default: module.ExpenseForm })),
)

const EDIT_FORM_ID = 'expense-form-edit'

/** Una sola vez por instalación — ver el efecto de la pista de swipe */
const SWIPE_HINT_KEY = 'spendly-swipe-hint'
/** Igual que el keyframe `swipe-hint` de index.css */
const SWIPE_HINT_MS = 1800

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
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
          <span className="font-ledger text-body font-semibold whitespace-nowrap">
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
  compact = false,
  emptyCta,
}: Readonly<ExpenseListProps>) {
  const { monthKey } = useMonth()
  const { openAdd } = useAddExpense()
  const deleteExpense = useDeleteExpense()
  const restoreExpense = useCreateExpense()
  // Ids con una mutation pausada por falta de red (alta o edición)
  const pendingIds = new Set(
    useMutationState({
      filters: { mutationKey: ['expenses'], predicate: (m) => m.state.isPaused },
      select: (m) => (m.state.variables as { id?: string } | undefined)?.id,
    }),
  )
  const [editing, setEditing] = useState<ExpenseWithCategory | null>(null)
  const [actionExpense, setActionExpense] = useState<ExpenseWithCategory | null>(null)
  // Una sola fila abierta a la vez, como iOS
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null)
  const touch = useIsTouch()
  const reducedMotion = useReducedMotion()
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

  function openActions(expense: ExpenseWithCategory) {
    void importExpenseForm()
    setActionExpense(expense)
  }

  function openEdit(expense: ExpenseWithCategory) {
    setActionExpense(null)
    setEditing(expense)
  }

  // ContentUnavailableView de iOS: símbolo, título, explicación y la acción
  const emptyState =
    expenses.length === 0 && emptyCta ? (
      <div
        className={cn(
          'reveal flex flex-col items-center gap-2 px-6 py-10 text-center',
          compact && 'flex-1 justify-center',
        )}
      >
        <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary">
          <ReceiptText className="size-7" aria-hidden />
        </span>
        <p className="text-headline text-label">Sin gastos este mes</p>
        <p className="max-w-[16rem] text-subhead text-label-secondary">
          Lo que registres aparece aquí, agrupado por día.
        </p>
        <Button
          type="button"
          variant="tinted"
          size="touch"
          className="mt-2 cursor-pointer rounded-full"
          onClick={openAdd}
        >
          <Plus className="size-4" aria-hidden />
          {emptyCta}
        </Button>
      </div>
    ) : null

  const editForm = editing ? (
    <Suspense fallback={<ExpenseFormSkeleton />}>
      <ExpenseForm
        expense={editing}
        formId={EDIT_FORM_ID}
        onSuccess={() => setEditing(null)}
      />
    </Suspense>
  ) : null

  return (
    <>
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
                  <span className="font-ledger text-footnote font-semibold text-label-secondary">
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
          onOpenChange={() => setActionExpense(null)}
          className="gap-0 px-4 pt-1 pb-[max(1rem,calc(env(safe-area-inset-bottom)-0.25rem))]"
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

      <FormSheet
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Editar gasto"
        trailing={<SheetConfirmButton label="Guardar cambios" form={EDIT_FORM_ID} />}
      >
        {editForm}
      </FormSheet>
    </>
  )
}
