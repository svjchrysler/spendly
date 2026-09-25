import { useState } from 'react'

/**
 * Devuelve `value`, pero congelado mientras `active` sea true. Plegar o
 * desplegar el iPhone Duo (o entrar en Split View) cruza el breakpoint con un
 * form abierto: si la presentación siguiera al ancho, Sheet ↔ Dialog
 * remontaría el form y se llevaría lo tipeado.
 */
export function useLatchedWhile<T>(active: boolean, value: T): T {
  const [latched, setLatched] = useState(value)
  if (!active && latched !== value) setLatched(value)
  return active ? latched : value
}
