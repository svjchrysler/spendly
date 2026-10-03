import { useState } from 'react'
import { toast } from 'sonner'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories'
import { useCategoryColor } from '@/hooks/useCategoryColor'
import { categoryColorOptions, defaultCategoryColor } from '@/lib/category-colors'
import { categoryEmojiOptions, resolveCategoryEmoji } from '@/lib/category-emojis'
import { dbErrorMessage } from '@/lib/db-errors'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  readonly category?: Category | null
  readonly formId: string
  readonly onSaved: () => void
}

/**
 * Form de categoría como los de iOS: vista previa arriba, nombre en una celda
 * y las opciones de ícono y color en grupos. El confirmar es el ✓ de la barra
 * del sheet, que envía este form por `formId`.
 */
export function CategoryForm({ category, formId, onSaved }: CategoryFormProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(
    resolveCategoryEmoji(category?.icon, category?.name) ?? '📦',
  )
  const [color, setColor] = useState(category?.color ?? defaultCategoryColor)
  // El swatch muestra el color del tema activo: lo que elegís es lo que ves
  const categoryColor = useCategoryColor()
  const saving = createCategory.isPending || updateCategory.isPending

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return
    if (!name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, name, icon, color })
        toast.success('Categoría actualizada')
      } else {
        await createCategory.mutateAsync({ name, icon, color })
        toast.success('Categoría creada')
      }
      onSaved()
    } catch (error) {
      toast.error(dbErrorMessage(error, 'No se pudo guardar la categoría'))
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5 pb-1">
      <div className="flex justify-center pt-1">
        <CategoryIcon emoji={icon} color={color} name={name} size="xl" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cat-name" className="list-section-header block px-4">
          Nombre
        </label>
        <input
          id="cat-name"
          name="nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Suscripciones"
          autoComplete="off"
          className="h-12 w-full rounded-xl bg-sheet-cell px-4 text-body text-label outline-none placeholder:text-label-tertiary focus-visible:ring-2 focus-visible:ring-primary/35"
        />
      </div>

      <fieldset className="space-y-1.5">
        <legend className="list-section-header mb-1.5 px-4">Ícono</legend>
        <div className="grid grid-cols-7 gap-1 rounded-xl bg-sheet-cell p-2">
          {categoryEmojiOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={cn(
                'pressable flex aspect-square cursor-pointer items-center justify-center rounded-full text-xl transition-colors',
                icon === emoji ? 'bg-primary/15 ring-2 ring-primary/50' : 'hover:bg-fill-quaternary',
              )}
              aria-label={`Ícono ${emoji}`}
              aria-pressed={icon === emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="list-section-header mb-1.5 px-4">Color</legend>
        <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-sheet-cell p-3">
          {categoryColorOptions.map((optionColor) => (
            <button
              key={optionColor}
              type="button"
              className={cn(
                'size-8 cursor-pointer rounded-full transition-transform duration-200 active:scale-90',
                // El elegido lleva el anillo de iOS: un hueco del color de la
                // celda y el color afuera — sobre un swatch redondo el borde
                // solo no alcanza para leer cuál está activo
                color === optionColor &&
                  'ring-2 ring-offset-2 ring-offset-[var(--sheet-cell)] [--tw-ring-color:var(--swatch)]',
              )}
              style={
                {
                  backgroundColor: categoryColor(optionColor),
                  '--swatch': categoryColor(optionColor),
                } as React.CSSProperties
              }
              onClick={() => setColor(optionColor)}
              aria-label={`Color ${optionColor}`}
              aria-pressed={color === optionColor}
            />
          ))}
        </div>
      </fieldset>
    </form>
  )
}
