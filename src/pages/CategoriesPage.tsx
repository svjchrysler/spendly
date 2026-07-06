import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatLabel } from '@/components/layout/Stat'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories'
import {
  categoryColorOptions,
  categoryIconOptions,
  getCategoryIcon,
} from '@/lib/category-icons'
import type { Category } from '@/types/database'

function CategoryForm({
  category,
  onSuccess,
}: {
  category?: Category
  onSuccess: () => void
}) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? 'receipt')
  const [color, setColor] = useState(category?.color ?? '#3B82F6')
  const isEditing = Boolean(category)

  async function handleSubmit(e: React.FormEvent) {
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
      <div className="space-y-2">
        <Label htmlFor="cat-icon">Icono</Label>
        <Select
          value={icon}
          onValueChange={(value) => value && setIcon(value)}
          items={categoryIconOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        >
          <SelectTrigger id="cat-icon" className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryIconOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {categoryColorOptions.map((optionColor) => (
            <button
              key={optionColor}
              type="button"
              className="size-8 cursor-pointer rounded-full border-2 transition-transform duration-200 hover:scale-110"
              style={{
                backgroundColor: optionColor,
                borderColor: color === optionColor ? '#fff' : 'transparent',
              }}
              onClick={() => setColor(optionColor)}
              aria-label={`Color ${optionColor}`}
            />
          ))}
        </div>
      </div>
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

  return (
    <div className="page-stack">
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <StatLabel>Categorías</StatLabel>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <Button
            className="w-full cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="size-4" />
            Nueva categoría
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setOpenCreate(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon)
            return (
              <Card
                key={category.id}
                className="border-border bg-transparent transition-colors duration-200 hover:bg-muted/20"
              >
                <CardContent className="flex items-center justify-between gap-2 p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <Icon className="size-4" style={{ color: category.color }} />
                    </div>
                    <p className="truncate font-medium">{category.name}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => setEditing(category)}
                      aria-label="Editar categoría"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer text-destructive"
                      onClick={() => setDeleting(category)}
                      aria-label="Eliminar categoría"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
          </DialogHeader>
          {editing ? (
            <CategoryForm category={editing} onSuccess={() => setEditing(null)} />
          ) : null}
        </DialogContent>
      </Dialog>

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
