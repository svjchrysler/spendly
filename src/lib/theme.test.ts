import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { getStoredTheme } from '@/lib/theme'

describe('getStoredTheme', () => {
  const store: Record<string, string> = {}

  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key]
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        for (const key of Object.keys(store)) delete store[key]
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns stored light/dark', () => {
    store['spendly-theme'] = 'light'
    expect(getStoredTheme()).toBe('light')
    store['spendly-theme'] = 'dark'
    expect(getStoredTheme()).toBe('dark')
  })

  it('falls back to prefers-color-scheme', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    expect(getStoredTheme()).toBe('light')
  })
})
