import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileDown, Plus, Tag, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
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
  FormSheet,
  SheetBackButton,
  SheetBarButton,
  SheetConfirmButton,
} from '@/components/ui/form-sheet'
import { List, ListRow, ListSection } from '@/components/ui/list'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoryListSkeleton } from '@/components/layout/skeletons'
import { BudgetForm } from '@/components/settings/BudgetForm'
import type { SettingsEntry } from '@/components/settings/settings-context'
import { useAuth } from '@/contexts/AuthContext'
import { useMonth } from '@/contexts/MonthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useCategories, useDeleteCategory } from '@/hooks/useCategories'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useMonthlyBudget, useMonthlyStats } from '@/hooks/useMonthlyStats'
import { appCurrency } from '@/lib/currency-config'
import { dbErrorMessage } from '@/lib/db-errors'
import { capitalize, formatCurrency, formatMonthYear } from '@/lib/format'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { ThemePreference } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

type Panel =
  | { id: 'root' }
  | { id: 'categorias' }
  | { id: 'categoria'; category: Category | null }
  | { id: 'presupuesto' }

const CATEGORY_FORM_ID = 'category-form'
const BUDGET_FORM_ID = 'budget-form'

function initialStack(entry: SettingsEntry): Panel[] {
  return entry === 'root' ? [{ id: 'root' }] : [{ id: 'root' }, { id: entry }]
}

/** Glifo de Ajustes de iOS: símbolo blanco sobre un cuadrado de color */
function SettingsGlyph({ tint, children }: Readonly<{ tint: string; children: ReactNode }>) {
  return (
    <span
      className={cn('flex size-7 items-center justify-center rounded-[0.5rem] text-white', tint)}
      aria-hidden
    >
      {children}
    </span>
  )
}

const themeItems = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
] as const satisfies readonly { value: ThemePreference; label: string }[]

function RootPanel({ onPush }: Readonly<{ onPush: (panel: Panel) => void }>) {
  const { user, signOut } = useAuth()
  const { preference, setPreference } = useTheme()
  const { canInstall, install } = useInstallPrompt()
  const { year, month } = useMonth()
  const { data: categories = [] } = useCategories()
  const { data: budget } = useMonthlyBudget(year, month)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'S'
  const monthLabel = formatMonthYear(year, month)

  // El export (y su query paginada) se baja recién al tocarlo
  async function handleExport() {
    setExporting(true)
    try {
      const { downloadExpensesCsv } = await import('@/lib/export-expenses')
      const count = await downloadExpensesCsv()
      toast.success(`${count} ${count === 1 ? 'gasto exportado' : 'gastos exportados'}`)
    } catch (error) {
      toast.error(dbErrorMessage(error, 'No se pudo exportar'))
    } finally {
      setExporting(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 pt-2 text-center">
        <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-primary/15 text-title-1 text-primary">
          {initial}
        </span>
        <p className="max-w-full truncate text-headline text-label">{user?.email}</p>
        <p className="text-subhead text-label-secondary">Cuenta personal · {appCurrency}</p>
        {!isSupabaseConfigured ? (
          <p className="mt-1 text-footnote text-destructive">
            Configura `.env.local` con tus credenciales de Supabase.
          </p>
        ) : null}
      </div>

      <List>
        <ListSection header="General">
          <ListRow
            leading={
              <SettingsGlyph tint="bg-tint-orange">
                <Tag className="size-4" strokeWidth={2.25} />
              </SettingsGlyph>
            }
            separatorInset="3.25rem"
            title="Categorías"
            trailing={
              <span className="text-body text-label-secondary">{categories.length}</span>
            }
            chevron
            onPress={() => onPush({ id: 'categorias' })}
          />
          <ListRow
            leading={
              <SettingsGlyph tint="bg-primary">
                <Wallet className="size-4" strokeWidth={2.25} />
              </SettingsGlyph>
            }
            separatorInset="3.25rem"
            title="Presupuesto"
            subtitle={capitalize(monthLabel)}
            trailing={
              <span className="font-ledger text-body text-label-secondary">
                {budget ? formatCurrency(budget.amount) : 'Sin definir'}
              </span>
            }
            chevron
            onPress={() => onPush({ id: 'presupuesto' })}
          />
        </ListSection>

        <ListSection
          header="Apariencia"
          footer="Automático sigue el modo claro u oscuro del sistema."
        >
          <div className="p-2">
            <SegmentedControl
              ariaLabel="Apariencia"
              value={preference}
              onValueChange={setPreference}
              items={themeItems}
            />
          </div>
        </ListSection>

        <ListSection header="Datos">
          <ListRow
            leading={
              <SettingsGlyph tint="bg-tint-blue">
                <FileDown className="size-4" strokeWidth={2.25} />
              </SettingsGlyph>
            }
            separatorInset="3.25rem"
            title={exporting ? 'Exportando…' : 'Exportar gastos (CSV)'}
            onPress={exporting ? undefined : () => void handleExport()}
          />
          {canInstall ? (
            <ListRow
              leading={
                <SettingsGlyph tint="bg-tint-gray">
                  <Download className="size-4" strokeWidth={2.25} />
                </SettingsGlyph>
              }
              separatorInset="3.25rem"
              title="Instalar app"
              onPress={() => void install()}
            />
          ) : null}
        </ListSection>

        <ListSection>
          <button
            type="button"
            className="list-row list-row--tappable justify-center"
            onClick={() => void handleSignOut()}
          >
            <span className="text-body text-destructive">Cerrar sesión</span>
          </button>
        </ListSection>
      </List>
    </div>
  )
}

function categoryUsage(item: { total: number; count: number } | undefined) {
  if (!item) return 'Sin gastos este mes'
  return `${formatCurrency(item.total)} · ${item.count} ${item.count === 1 ? 'gasto' : 'gastos'}`
}

function CategoriesPanel({ onEdit }: Readonly<{ onEdit: (category: Category) => void }>) {
  const { data: categories = [], isLoading } = useCategories()
  const { year, month } = useMonth()
  // Cuánto pesa cada categoría en el mes: contexto antes de editarla, y la
  // razón visible de por qué una no se puede borrar
  const { data: stats } = useMonthlyStats(year, month)
  const monthLabel = formatMonthYear(year, month)
  const usage = new Map(stats?.categoryBreakdown.map((item) => [item.id, item]))

  if (isLoading) return <CategoryListSkeleton rows={6} />

  return (
    <List>
      <ListSection
        footer={`Uso de ${monthLabel}. Solo se pueden eliminar categorías sin gastos asociados.`}
        stagger="on-enter"
      >
        {categories.map((category) => (
          <ListRow
            key={category.id}
            separatorInset="4rem"
            leading={
              <CategoryIcon
                icon={category.icon}
                color={category.color}
                name={category.name}
                size="md"
              />
            }
            title={category.name}
            subtitle={categoryUsage(usage.get(category.id))}
            chevron
            onPress={() => onEdit(category)}
          />
        ))}
      </ListSection>
    </List>
  )
}

function CategoryPanel({
  category,
  onDone,
}: Readonly<{ category: Category | null; onDone: () => void }>) {
  const deleteCategory = useDeleteCategory()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    if (!category) return
    try {
      await deleteCategory.mutateAsync(category.id)
      toast.success('Categoría eliminada')
      setConfirming(false)
      onDone()
    } catch (error) {
      setConfirming(false)
      toast.error(
        dbErrorMessage(error, 'No se pudo eliminar la categoría', {
          // on delete restrict
          '23503': 'Tiene gastos asociados. Muévelos a otra categoría antes de eliminarla.',
        }),
      )
    }
  }

  return (
    <div className="space-y-6">
      <CategoryForm category={category} formId={CATEGORY_FORM_ID} onSaved={onDone} />
      {category ? (
        <div className="list-group">
          <button
            type="button"
            className="list-row list-row--tappable justify-center"
            onClick={() => setConfirming(true)}
          >
            <span className="inline-flex items-center gap-2 text-body text-destructive">
              <Trash2 className="size-4" aria-hidden />
              Eliminar categoría
            </span>
          </button>
        </div>
      ) : null}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar “{category?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo puedes eliminar categorías sin gastos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type SettingsSheetProps = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: SettingsEntry
  /** Cambia en cada apertura: vuelve el stack al punto de entrada */
  session: number
}>

/**
 * Ajustes como sheet con su propio stack de navegación, igual que la cuenta en
 * las apps de Apple: las filas empujan pantallas dentro del sheet y la barra
 * cambia a "volver" + el confirmar de cada pantalla.
 */
export function SettingsSheet({ open, onOpenChange, entry, session }: SettingsSheetProps) {
  const [stack, setStack] = useState<Panel[]>(() => initialStack(entry))
  const [direction, setDirection] = useState<'next' | 'prev' | 'none'>('none')
  const [seenSession, setSeenSession] = useState(session)
  if (seenSession !== session) {
    setSeenSession(session)
    setStack(initialStack(entry))
    setDirection('none')
  }

  const panel = stack[stack.length - 1]
  const push = (next: Panel) => {
    setDirection('next')
    setStack((current) => [...current, next])
  }
  const pop = () => {
    setDirection('prev')
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
  }
  // Entrar directo a una pantalla (el "Editar" del presupuesto en Resumen) y
  // guardar cierra el sheet: volver a Ajustes sería un desvío que no pediste
  const finish = () => {
    if (entry !== 'root' && stack.length === 2) onOpenChange(false)
    else pop()
  }

  const parentTitle = (() => {
    const parent = stack[stack.length - 2]
    if (!parent) return ''
    return parent.id === 'categorias' ? 'Categorías' : 'Ajustes'
  })()

  let title = 'Ajustes'
  let trailing: ReactNode = null
  let body: ReactNode = <RootPanel onPush={push} />

  if (panel.id === 'categorias') {
    title = 'Categorías'
    trailing = (
      <SheetBarButton label="Nueva categoría" onClick={() => push({ id: 'categoria', category: null })}>
        <Plus className="size-5" strokeWidth={2.25} />
      </SheetBarButton>
    )
    body = <CategoriesPanel onEdit={(category) => push({ id: 'categoria', category })} />
  } else if (panel.id === 'categoria') {
    title = panel.category ? 'Editar categoría' : 'Nueva categoría'
    trailing = <SheetConfirmButton label="Guardar categoría" form={CATEGORY_FORM_ID} />
    body = <CategoryPanel category={panel.category} onDone={pop} />
  } else if (panel.id === 'presupuesto') {
    title = 'Presupuesto'
    trailing = <SheetConfirmButton label="Guardar presupuesto" form={BUDGET_FORM_ID} />
    body = <BudgetForm formId={BUDGET_FORM_ID} onSaved={finish} />
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      leading={stack.length > 1 ? <SheetBackButton label={parentTitle} onClick={pop} /> : undefined}
      trailing={trailing}
      bodyClassName="pb-2"
    >
      {/* Push/pop: la pantalla entra desde el lado hacia el que navegaste */}
      <div key={stack.length} data-dir={direction} className="swap">
        {body}
      </div>
    </FormSheet>
  )
}
