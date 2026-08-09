import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Instalación a demanda (Chrome/Edge/Android). Interceptamos el evento para
 * que el browser no tire su propia barra y ofrecerlo desde el menú de perfil.
 *
 * iOS no dispara `beforeinstallprompt`: ahí `canInstall` queda en false y la
 * opción no aparece, que es lo correcto — se instala desde Compartir.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferred(null)

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      await deferred.userChoice
    } finally {
      // El evento es de un solo uso: aceptado o no, ya no sirve
      setDeferred(null)
    }
  }, [deferred])

  return { canInstall: deferred !== null, install }
}
