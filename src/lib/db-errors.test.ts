import { describe, expect, it } from 'vitest'
import { dbErrorMessage } from '@/lib/db-errors'

describe('dbErrorMessage', () => {
  it('translates known Postgres codes', () => {
    const fk = { code: '23503', message: 'violates foreign key' }
    expect(dbErrorMessage(fk, 'x')).toMatch(/dependen/)
    expect(dbErrorMessage(fk, 'x', { '23503': 'Tiene gastos' })).toBe('Tiene gastos')
  })

  it('never leaks the raw message for unknown errors', () => {
    expect(dbErrorMessage({ code: 'XX000', message: 'internal' }, 'No se pudo guardar')).toBe(
      'No se pudo guardar',
    )
    expect(dbErrorMessage(new Error('Failed to fetch'), 'No se pudo guardar')).toBe(
      'No se pudo guardar',
    )
  })
})
