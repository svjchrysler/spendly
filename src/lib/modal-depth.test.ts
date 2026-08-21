import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { popModal, pushModal, resetModalDepth } from '@/lib/modal-depth'

/** Mínimo de `documentElement` que usa el módulo: atributos + custom props. */
function fakeRoot() {
  const attrs: Record<string, string> = {}
  const props: Record<string, string> = {}
  return {
    attrs,
    props,
    setAttribute: (k: string, v: string) => {
      attrs[k] = v
    },
    getAttribute: (k: string) => attrs[k] ?? null,
    hasAttribute: (k: string) => k in attrs,
    removeAttribute: (k: string) => {
      delete attrs[k]
    },
    style: {
      setProperty: (k: string, v: string) => {
        props[k] = v
      },
      removeProperty: (k: string) => {
        delete props[k]
      },
    },
  }
}

describe('modal-depth', () => {
  let root: ReturnType<typeof fakeRoot>

  beforeEach(() => {
    vi.useFakeTimers()
    root = fakeRoot()
    vi.stubGlobal('document', { documentElement: root })
    vi.stubGlobal('window', {
      scrollY: 0,
      matchMedia: () => ({ matches: false }),
    })
    resetModalDepth()
  })

  afterEach(() => {
    resetModalDepth()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('marca la profundidad al abrir y guarda el scroll de ese momento', () => {
    vi.stubGlobal('window', { scrollY: 420, matchMedia: () => ({ matches: false }) })
    pushModal()
    expect(root.getAttribute('data-modal')).toBe('1')
    expect(root.props['--modal-scroll']).toBe('420px')
  })

  it('borra el atributo recién después de la transición de salida', () => {
    pushModal()
    popModal()
    // Todavía saliendo: el transform de reposo tiene que seguir declarado
    expect(root.getAttribute('data-modal')).toBe('0')

    vi.advanceTimersByTime(320)
    expect(root.hasAttribute('data-modal')).toBe(false)
    expect(root.props['--modal-scroll']).toBeUndefined()
  })

  it('cuenta modales anidados: solo el último cierra', () => {
    pushModal()
    pushModal()
    popModal()
    vi.advanceTimersByTime(320)
    expect(root.getAttribute('data-modal')).toBe('1')

    popModal()
    vi.advanceTimersByTime(320)
    expect(root.hasAttribute('data-modal')).toBe(false)
  })

  it('abrir otro durante la salida cancela el borrado', () => {
    pushModal()
    popModal()
    vi.advanceTimersByTime(100)
    pushModal()
    vi.advanceTimersByTime(320)
    expect(root.getAttribute('data-modal')).toBe('1')
  })

  it('no toca el DOM con prefers-reduced-motion', () => {
    vi.stubGlobal('window', { scrollY: 0, matchMedia: () => ({ matches: true }) })
    pushModal()
    expect(root.hasAttribute('data-modal')).toBe(false)
    // Y el pop desbalanceado no rompe el refcount
    popModal()
    expect(root.hasAttribute('data-modal')).toBe(false)
  })
})
