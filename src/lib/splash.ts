const SPLASH_ID = 'app-splash'
const MAX_MS = 5000

let dismissed = false

/** Arranca el failsafe al cargar el bundle (import side-effect desde main). */
export function armSplashFailsafe() {
  window.setTimeout(() => dismissSplash(), MAX_MS)
}

/** Oculta el splash HTML con fade; idempotente. */
export function dismissSplash() {
  if (dismissed) return
  const el = document.getElementById(SPLASH_ID)
  if (!el) {
    dismissed = true
    return
  }
  dismissed = true
  el.classList.add('is-done')
  const remove = () => el.remove()
  el.addEventListener('transitionend', remove, { once: true })
  window.setTimeout(remove, 450)
}
