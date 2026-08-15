import { useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { resolveCategoryColor } from '@/lib/category-colors'

/**
 * Resuelve el color de una categoría para el tema activo.
 *
 * Se usa en las hojas que efectivamente pintan (icono, donut, asignación), no
 * en las queries: el hex guardado sigue siendo la identidad y viaja intacto
 * por los hooks de datos.
 */
export function useCategoryColor() {
  const { theme } = useTheme()
  return useCallback(
    (color: string | null | undefined) => resolveCategoryColor(color, theme),
    [theme],
  )
}
