import { registerSW } from 'virtual:pwa-register'

/** Un modal abierto = el usuario está a mitad de algo (form, confirmación). */
function isBusy() {
  return document.querySelector('[data-slot="sheet-content"], [role="dialog"]') !== null
}

/**
 * Registro del SW con update diferido, al estilo de una app nativa: la versión
 * nueva se descarga en silencio y se aplica cuando la app pasa a background,
 * no en medio de la sesión. Recargar en caliente (registerType `autoUpdate`)
 * se lleva puesto un gasto a medio cargar.
 *
 * Si nunca se llega a aplicar, el SW en espera activa igual al cerrar la app
 * (`skipWaiting: false`), que es exactamente el comportamiento nativo.
 */
export function registerPwa() {
  let pending = false

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      pending = true
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      const check = () => {
        void registration.update()
      }

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })

      // ponytail: hourly poll while open; iOS ignores background timers anyway
      window.setInterval(check, 60 * 60 * 1000)
    },
    onOfflineReady() {
      // App shell cached — no toast; native apps don't announce this.
    },
  })

  const applyIfIdle = () => {
    if (!pending || document.visibilityState !== 'hidden' || isBusy()) return
    pending = false
    void updateSW(true)
  }

  document.addEventListener('visibilitychange', applyIfIdle)

  return updateSW
}
