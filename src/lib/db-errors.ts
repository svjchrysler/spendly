/*
  Los errores de Supabase/PostgREST llegan en inglés ("violates foreign key
  constraint…"). La UI nunca los muestra crudos: se traducen los casos que el
  usuario puede provocar y el resto cae en el mensaje genérico de la acción.
*/
const messagesByCode: Record<string, string> = {
  '23503': 'Hay otros datos que dependen de este registro.',
  '23505': 'Ya existe un registro igual.',
  '23514': 'Algún valor no es válido.',
  // RLS: sesión vencida o fila ajena
  '42501': 'Tu sesión expiró. Vuelve a iniciar sesión.',
  PGRST301: 'Tu sesión expiró. Vuelve a iniciar sesión.',
}

/** `byCode` pisa el texto por acción: un 23503 al borrar una categoría no
 *  significa lo mismo que al guardar un gasto. */
export function dbErrorMessage(
  error: unknown,
  fallback: string,
  byCode: Record<string, string> = {},
) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Sin conexión. Inténtalo de nuevo cuando vuelva la red.'
  }
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : undefined
  return (code && (byCode[code] ?? messagesByCode[code])) || fallback
}
