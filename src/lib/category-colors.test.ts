import { describe, expect, it } from 'vitest'
import {
  categoryColorOptions,
  defaultCategoryColor,
  resolveCategoryColor,
} from '@/lib/category-colors'

describe('resolveCategoryColor', () => {
  it('deja el hex intacto en tema claro', () => {
    for (const color of categoryColorOptions) {
      expect(resolveCategoryColor(color, 'light')).toBe(color)
    }
  })

  it('mapea toda la paleta a un par más claro en oscuro', () => {
    for (const color of categoryColorOptions) {
      const dark = resolveCategoryColor(color, 'dark')
      expect(dark).toBeDefined()
      expect(dark).not.toBe(color)
      expect(dark).toMatch(/^#[0-9a-f]{6}$/)
      expect(luminance(dark!)).toBeGreaterThan(luminance(color))
    }
  })

  it('aclara colores fuera de la paleta que serían muy oscuros', () => {
    const dark = resolveCategoryColor('#1a2b4c', 'dark')
    expect(dark).toMatch(/^#[0-9a-f]{6}$/)
    expect(luminance(dark!)).toBeGreaterThan(luminance('#1a2b4c'))
  })

  it('no toca un color que ya es claro', () => {
    expect(resolveCategoryColor('#ffdd99', 'dark')).toBe('#ffdd99')
  })

  it('deja pasar valores no-hex, como las CSS vars del donut', () => {
    expect(resolveCategoryColor('var(--chart-5)', 'dark')).toBe('var(--chart-5)')
  })

  it('devuelve undefined sin color', () => {
    expect(resolveCategoryColor(null, 'dark')).toBeUndefined()
    expect(resolveCategoryColor(undefined, 'light')).toBeUndefined()
  })

  it('el color por defecto es parte de la paleta', () => {
    expect(categoryColorOptions).toContain(defaultCategoryColor)
  })
})

/** Luminancia relativa aproximada, solo para comparar dos hex en el test. */
function luminance(hex: string): number {
  const value = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(
    (i) => Number.parseInt(value.slice(i, i + 2), 16) / 255,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
