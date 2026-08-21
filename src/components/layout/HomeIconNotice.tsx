import { useState } from 'react'
import { Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markHomeIconSeen, shouldOfferHomeIconRefresh } from '@/lib/home-icon'

/**
 * Aviso único para la PWA ya instalada en iOS: el icono del home screen quedó
 * congelado en el diseño con el que se instaló y solo se actualiza
 * reinstalando el acceso directo (ver `lib/home-icon.ts`).
 *
 * No es un modal: no bloquea nada y se descarta solo con "Listo". Vive donde
 * `OfflineBanner`, empujado desde el header con `notice-in`.
 */
export function HomeIconNotice() {
  const [open, setOpen] = useState(shouldOfferHomeIconRefresh)

  if (!open) return null

  function dismiss() {
    markHomeIconSeen()
    setOpen(false)
  }

  return (
    <section
      aria-labelledby="home-icon-notice-title"
      className="notice-in mx-4 mt-3 rounded-2xl bg-group-surface p-4 ring-1 ring-border sm:mx-6 lg:mx-8"
    >
      <div className="flex items-start gap-3">
        <img
          src="/apple-touch-icon.png"
          alt=""
          width={44}
          height={44}
          // rounded-[22%]: la superelipse de iOS no se puede replicar en CSS,
          // pero a 44px el radio proporcional ya la aproxima
          className="size-11 shrink-0 rounded-[22%]"
        />
        <div className="min-w-0 flex-1">
          <h2 id="home-icon-notice-title" className="text-[15px] font-semibold tracking-tight">
            Spendly tiene icono nuevo
          </h2>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            iOS guarda el icono al momento de instalar la app, así que el de tu pantalla de
            inicio sigue siendo el viejo. Para cambiarlo hay que volver a agregarla:
          </p>
          <ol className="mt-3 space-y-1.5 text-sm leading-snug text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-ledger text-foreground/60">1</span>
              <span>
                Mantené presionado el icono de Spendly y elegí{' '}
                <span className="text-foreground">Eliminar app</span> → Eliminar de pantalla de
                inicio.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-ledger text-foreground/60">2</span>
              <span>
                Abrí Spendly en Safari, tocá{' '}
                <Share
                  className="inline size-3.5 shrink-0 align-[-2px]"
                  aria-label="Compartir"
                />{' '}
                y elegí <span className="text-foreground">Agregar a inicio</span>.
              </span>
            </li>
          </ol>
          <p className="mt-3 text-xs leading-snug text-muted-foreground">
            Tus gastos están en la nube y no se tocan; solo vas a tener que iniciar sesión de
            nuevo.
          </p>
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="touch" onClick={dismiss}>
              Listo
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Descartar aviso"
          className="pressable -mr-1 -mt-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </section>
  )
}
