import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryListSkeleton } from '@/components/layout/skeletons'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import {
  categoryEmojiOptions,
  resolveCategoryEmoji,
} from '@/lib/category-emojis'
import { categoryColorOptions, defaultCategoryColor } from '@/lib/category-icons'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  readonly category?: Category
  readonly onSuccess: () => void
}

function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(
    resolveCategoryEmoji(category?.icon, category?.name) ?? '📦',
  )
  const [color, setColor] = useState(category?.color ?? defaultCategoryColor)
  const isEditing = Boolean(category)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ id: category.id, name, icon, color })
        toast.success('Categoría actualizada')
      } else {
        await createCategory.mutateAsync({ name, icon, color })
        toast.success('Categoría creada')
      }
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Nombre</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Suscripciones"
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm leading-none font-medium">Icono</legend>
        <div className="flex flex-wrap gap-2">
          {categoryEmojiOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={cn(
                'flex size-9 cursor-pointer items-center justify-center rounded-lg border text-lg transition-colors',
                icon === emoji
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border/60 bg-muted/20 hover:bg-muted/40',
              )}
              aria-label={`Icono ${emoji}`}
              aria-pressed={icon === emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-sm leading-none font-medium">Color</legend>
        <div className="flex flex-wrap gap-2">
          {categoryColorOptions.map((optionColor) => (
            <button
              key={optionColor}
              type="button"
              className={cn(
                'size-8 cursor-pointer rounded-full border-2 transition-transform duration-200 hover:scale-110',
                color === optionColor ? 'border-background' : 'border-transparent',
              )}
              style={{ backgroundColor: optionColor }}
              onClick={() => setColor(optionColor)}
              aria-label={`Color ${optionColor}`}
              aria-pressed={color === optionColor}
            />
          ))}
        </div>
      </fieldset>
      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={createCategory.isPending || updateCategory.isPending}
      >
        {isEditing ? 'Actualizar' : 'Crear categoría'}
      </Button>
    </form>
  )
}

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()
  const isDesktop = useIsDesktop()
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteCategory.mutateAsync(deleting.id)
      toast.success('Categoría eliminada')
      setDeleting(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  const createForm = <CategoryForm onSuccess={() => setOpenCreate(false)} />
  const editForm = editing ? (
    <CategoryForm category={editing} onSuccess={() => setEditing(null)} />
  ) : null

  return (
    <div className="flex flex-col gap-4 pb-4 lg:gap-5 lg:pb-8">
      <header className="flex items-end justify-between gap-3 border-b border-border/70 pb-4">
        <div className="min-w-0 space-y-1.5">
          <p className="stat-label">Organiza tus gastos</p>
          <h1 className="page-title">Categorías</h1>
        </div>
        <Button
          className="pressable min-h-11 cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpenCreate(true)}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nueva categoría</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </header>

      {isLoading ? (
        <CategoryListSkeleton />
      ) : (
        <div className="grid pt-1 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-12">
          {categories.map((category) => {
            return (
              <div
                key={category.id}
                className="row-hover flex min-h-12 items-center justify-between gap-2 border-b border-border/40 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    name={category.name}
                    size="md"
                  />
                  <p className="truncate font-medium">{category.name}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 cursor-pointer"
                    onClick={() => setEditing(category)}
                    aria-label="Editar categoría"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 cursor-pointer text-destructive"
                    onClick={() => setDeleting(category)}
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isDesktop ? (
        <>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva categoría</DialogTitle>
              </DialogHeader>
              {createForm}
            </DialogContent>
          </Dialog>
          <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar categoría</DialogTitle>
              </DialogHeader>
              {editForm}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Sheet open={openCreate} onOpenChange={setOpenCreate}>
            <SheetContent
              side="bottom"
              className="gap-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1"
            >
              <SheetHeader className="pb-3">
                <SheetTitle>Nueva categoría</SheetTitle>
              </SheetHeader>
              {createForm}
            </SheetContent>
          </Sheet>
          <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
            <SheetContent
              side="bottom"
              className="gap-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1"
            >
              <SheetHeader className="pb-3">
                <SheetTitle>Editar categoría</SheetTitle>
              </SheetHeader>
              {editForm}
            </SheetContent>
          </Sheet>
        </>
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo puedes eliminar categorías sin gastos asociados.
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
    </div>
  )
}
