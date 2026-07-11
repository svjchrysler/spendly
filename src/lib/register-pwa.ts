import { registerSW } from 'virtual:pwa-register'

// Auto-update + check on resume (iOS PWA only revalidates SW when foregrounded).
export function registerPwa() {
  const updateSW = registerSW({
    immediate: true,
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

  return updateSW
}
