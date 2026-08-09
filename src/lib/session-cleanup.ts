import { queryClient, queryPersister } from '@/lib/query-client'

/** Cachés de Workbox que guardan respuestas con datos del usuario. */
const DATA_CACHES = ['supabase-rest']

/**
 * Borra todo rastro local de la sesión: cache de TanStack (memoria +
 * localStorage) y las respuestas REST que guardó el service worker.
 *
 * Sin esto, tras cerrar sesión los gastos del usuario anterior siguen
 * legibles en `spendly-query-cache` y en CacheStorage, y se pintan por un
 * instante al entrar con otra cuenta. Es idempotente y nunca lanza: se
 * ejecuta en el camino del logout y no debe poder bloquearlo.
 */
export async function purgeLocalUserData() {
  try {
    queryClient.clear()
    await queryPersister.removeClient()
  } catch {
    /* cache en memoria/localStorage inaccesible — seguimos con CacheStorage */
  }

  if (typeof caches === 'undefined') return

  await Promise.allSettled(DATA_CACHES.map((name) => caches.delete(name)))
}
