import { describe, expect, it } from 'vitest'
import { palette, themeChromeColor } from '@/lib/palette'

describe('palette', () => {
  it('theme chrome follows background', () => {
    expect(themeChromeColor('light')).toBe(palette.light.background)
    expect(themeChromeColor('dark')).toBe(palette.dark.background)
  })

  it('defines distinct light and dark primaries', () => {
    expect(palette.light.primary).not.toBe(palette.dark.primary)
    expect(palette.light.background).not.toBe(palette.dark.background)
  })
})
