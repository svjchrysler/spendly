import type { ComponentType, ReactNode } from 'react'
import { Check, ChevronLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useLatchedWhile } from '@/hooks/useLatchedWhile'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

type BarButtonProps = Readonly<{
  label: string
  onClick?: () => void
  /** Botón de envío de un `<form id>` que vive en el cuerpo del sheet */
  form?: string
  disabled?: boolean
  children: ReactNode
}>

/** Cerrar: xmark en una cápsula de vidrio, el leading de los sheets de iOS 26 */
export function SheetCloseButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <Button
      type="button"
      variant="glass"
      size="icon-touch"
      className="cursor-pointer"
      onClick={onClick}
      aria-label="Cerrar"
    >
      <X className="size-5" strokeWidth={2.25} />
    </Button>
  )
}

export function SheetBackButton({
  label,
  onClick,
}: Readonly<{ label: string; onClick: () => void }>) {
  return (
    <Button
      type="button"
      variant="glass"
      size="icon-touch"
      className="cursor-pointer"
      onClick={onClick}
      aria-label={`Volver a ${label}`}
    >
      <ChevronLeft className="size-5" strokeWidth={2.25} />
    </Button>
  )
}

/** Confirmar: checkmark en vidrio teñido. Con `form` envía ese formulario. */
export function SheetConfirmButton({ label, onClick, form, disabled }: Omit<BarButtonProps, 'children'>) {
  return (
    <Button
      type={form ? 'submit' : 'button'}
      form={form}
      variant="prominent"
      size="icon-touch"
      className="cursor-pointer"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <Check className="size-5" strokeWidth={2.5} />
    </Button>
  )
}

/** Acción secundaria de barra (p. ej. "+" en una lista dentro del sheet) */
export function SheetBarButton({ label, onClick, disabled, children }: BarButtonProps) {
  return (
    <Button
      type="button"
      variant="glass"
      size="icon-touch"
      className="cursor-pointer"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </Button>
  )
}

type TitleComponent = ComponentType<{ className?: string; children?: ReactNode }>

function SheetBar({
  title,
  Title,
  leading,
  trailing,
}: Readonly<{
  title: ReactNode
  Title: TitleComponent
  leading: ReactNode
  trailing?: ReactNode
}>) {
  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 px-3 pt-3 pb-2">
      <div className="flex justify-start">{leading}</div>
      <Title className="truncate text-center">{title}</Title>
      <div className="flex justify-end">{trailing}</div>
    </div>
  )
}

type FormSheetProps = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** Por defecto, cerrar */
  leading?: ReactNode
  trailing?: ReactNode
  children: ReactNode
  /** Clases del cuerpo (debajo de la barra) */
  bodyClassName?: string
}>

/**
 * Sheet de formulario de iOS 26/27: barra con título centrado, cerrar a la
 * izquierda y confirmar a la derecha, ambos en vidrio.
 *
 * Compact → bottom sheet que flota. Regular → form sheet centrado (Dialog).
 * La presentación se congela mientras está abierto: plegar o desplegar el
 * iPhone Duo con el form a medio llenar no lo remonta.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  leading,
  trailing,
  children,
  bodyClassName,
}: FormSheetProps) {
  const isDesktop = useIsDesktop()
  const asDialog = useLatchedWhile(open, isDesktop)
  const close = <SheetCloseButton onClick={() => onOpenChange(false)} />

  if (asDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-[28rem]">
          <SheetBar title={title} Title={DialogTitle} leading={leading ?? close} trailing={trailing} />
          <div className={cn('px-4 pb-5', bodyClassName)}>{children}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        onOpenChange={onOpenChange}
        className="gap-0 pb-[max(1rem,calc(env(safe-area-inset-bottom)-0.25rem))]"
      >
        <SheetBar title={title} Title={SheetTitle} leading={leading ?? close} trailing={trailing} />
        <div className={cn('px-4', bodyClassName)}>{children}</div>
      </SheetContent>
    </Sheet>
  )
}
