import { describe, expect, it } from 'vitest'
import { matchShortcut, type ShortcutContext, type ShortcutKey } from '@/lib/keyboard-shortcuts'

function key(value: string, extra: Partial<ShortcutKey> = {}): ShortcutKey {
  return { key: value, metaKey: false, ctrlKey: false, altKey: false, repeat: false, ...extra }
}

const idle: ShortcutContext = { editable: false, ownsArrows: false, modalOpen: false }

describe('matchShortcut', () => {
  it('maps the four shortcuts', () => {
    expect(matchShortcut(key('n'), idle)).toBe('add')
    expect(matchShortcut(key('N'), idle)).toBe('add')
    expect(matchShortcut(key('/'), idle)).toBe('search')
    expect(matchShortcut(key('ArrowLeft'), idle)).toBe('prev-month')
    expect(matchShortcut(key('ArrowRight'), idle)).toBe('next-month')
  })

  it('ignores other keys', () => {
    expect(matchShortcut(key('a'), idle)).toBeNull()
    expect(matchShortcut(key('ArrowUp'), idle)).toBeNull()
    expect(matchShortcut(key('Escape'), idle)).toBeNull()
  })

  it('leaves browser and system combos alone', () => {
    expect(matchShortcut(key('n', { metaKey: true }), idle)).toBeNull()
    expect(matchShortcut(key('n', { ctrlKey: true }), idle)).toBeNull()
    expect(matchShortcut(key('ArrowLeft', { metaKey: true }), idle)).toBeNull()
    expect(matchShortcut(key('ArrowRight', { altKey: true }), idle)).toBeNull()
  })

  it('accepts shift, which a Spanish layout needs for "/"', () => {
    expect(matchShortcut(key('/', { shiftKey: true }), idle)).toBe('search')
    expect(matchShortcut(key('N', { shiftKey: true }), idle)).toBe('add')
  })

  it('does not fire on key repeat or while composing', () => {
    expect(matchShortcut(key('ArrowRight', { repeat: true }), idle)).toBeNull()
    expect(matchShortcut(key('n', { isComposing: true }), idle)).toBeNull()
  })

  it('stays out of the way while typing or inside a modal', () => {
    expect(matchShortcut(key('n'), { ...idle, editable: true })).toBeNull()
    expect(matchShortcut(key('/'), { ...idle, editable: true })).toBeNull()
    expect(matchShortcut(key('n'), { ...idle, modalOpen: true })).toBeNull()
    expect(matchShortcut(key('ArrowLeft'), { ...idle, modalOpen: true })).toBeNull()
  })

  it('lets controls that own the arrows keep them', () => {
    const onSegmented = { ...idle, ownsArrows: true }
    expect(matchShortcut(key('ArrowLeft'), onSegmented)).toBeNull()
    expect(matchShortcut(key('ArrowRight'), onSegmented)).toBeNull()
    // Las letras no son de esos controles
    expect(matchShortcut(key('n'), onSegmented)).toBe('add')
  })
})
