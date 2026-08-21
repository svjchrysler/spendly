/**
 * iOS congela el icono del home screen en el momento de "Agregar a inicio":
 * no vuelve a leer `apple-touch-icon` ni el manifest de una app ya instalada,
 * y no hay API para reemplazarlo. La única forma de que un icono viejo se
 * actualice es reinstalar el acceso directo.
 *
 * Android/Chrome sí refresca solo cuando cambia el manifest, y la pestaña del
 * navegador toma el favicon nuevo en la siguiente carga: este aviso es solo
 * para la PWA instalada en iOS.
 */

/** Subir esto vuelve a ofrecer la actualización una única vez. */
export const HOME_ICON_VERSION = 2

const SEEN_KEY = 'spendly:home-icon-version'
/** Persist de TanStack Query — su presencia prueba que la app ya se usó acá. */
const APP_DATA_KEY = 'spendly-query-cache'

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    /* Safari en modo privado tira al tocar localStorage */
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* sin storage no hay flag: el aviso se mostrará de nuevo, no rompe nada */
  }
}

export function isIosStandalone() {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent
  // iPadOS 13+ se reporta como Mac: lo delata el touch
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  return isIos && standalone
}

/**
 * `true` solo para una app que ya estaba instalada en iOS antes de este arte.
 * Una instalación nueva ya trae el icono nuevo: ahí se marca la versión y el
 * aviso no aparece nunca. Se distingue por el cache persistido — iOS le da a
 * la app standalone su propio storage, así que uno recién instalado está vacío.
 */
export function shouldOfferHomeIconRefresh() {
  if (typeof window === 'undefined') return false
  if (readStorage(SEEN_KEY) === String(HOME_ICON_VERSION)) return false

  if (!isIosStandalone() || readStorage(APP_DATA_KEY) === null) {
    markHomeIconSeen()
    return false
  }

  return true
}

export function markHomeIconSeen() {
  writeStorage(SEEN_KEY, String(HOME_ICON_VERSION))
}
