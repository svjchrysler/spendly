"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { useSheetDrag } from "@/hooks/useSheetDrag"
import { useModalDepthRoot } from "@/hooks/useModalDepth"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

type SheetProps = Readonly<SheetPrimitive.Root.Props>
type SheetTriggerProps = Readonly<SheetPrimitive.Trigger.Props>
type SheetCloseProps = Readonly<SheetPrimitive.Close.Props>
type SheetPortalProps = Readonly<SheetPrimitive.Portal.Props>
type SheetContentProps = Readonly<
  SheetPrimitive.Popup.Props & {
    side?: "top" | "right" | "bottom" | "left"
    showCloseButton?: boolean
    showGrabber?: boolean
  }
>
type SheetHeaderProps = Readonly<React.ComponentProps<"div">>
type SheetFooterProps = Readonly<React.ComponentProps<"div">>
type SheetTitleProps = Readonly<SheetPrimitive.Title.Props>
type SheetDescriptionProps = Readonly<SheetPrimitive.Description.Props>

function Sheet({ open, defaultOpen, onOpenChange, ...props }: SheetProps) {
  // La pantalla de atrás retrocede en Z mientras esto esté abierto
  const handleOpenChange = useModalDepthRoot(open, defaultOpen, onOpenChange)

  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      {...props}
    />
  )
}

function SheetTrigger({ ...props }: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPortalProps) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay-strong transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
  )
}

type SheetOverlayProps = Readonly<SheetPrimitive.Backdrop.Props>

function SheetContent({
  className,
  children,
  side = "right",
  // Los bottom sheets llevan su botón de cerrar en la `SheetBar`
  showCloseButton = side !== "bottom",
  showGrabber,
  onOpenChange,
  ...props
}: SheetContentProps & { onOpenChange?: (open: boolean) => void }) {
  const grabber = showGrabber ?? side === "bottom"
  const { dragHandlers } = useSheetDrag({
    enabled: side === "bottom",
    onDismiss: () => onOpenChange?.(false),
  })

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        {...(side === "bottom" ? dragHandlers : {})}
        className={cn(
          // ponytail: bottom sheets use --keyboard-inset (visualViewport) so the soft keyboard doesn't cover inputs
          // iOS sheet curve ≈ cubic-bezier(0.32, 0.72, 0, 1)
          // El transform del drag y el `translate` de entrada/salida de Base UI
          // son propiedades distintas: componen en vez de pisarse.
          // En ancho regular (Duo abierto) el bottom sheet se centra con margin,
          // no con transform: el drag ya es dueño del transform.
          // iOS 26/27: el sheet flota separado de los bordes con radio
          // concéntrico a la pantalla, sobre el canvas agrupado de sheet.
          "sheet-draggable fixed z-50 flex flex-col gap-4 bg-sheet bg-clip-padding text-sm text-popover-foreground shadow-[0_-8px_40px_-12px_var(--shadow-elevated)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-[calc(var(--keyboard-inset,0px)+0.5rem)] data-[side=bottom]:h-auto data-[side=bottom]:max-h-[min(92dvh,calc(100dvh-var(--keyboard-inset,0px)-1rem))] data-[side=bottom]:overflow-y-auto data-[side=bottom]:overscroll-contain data-[side=bottom]:rounded-[2.25rem] data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-[side=bottom]:md:mx-auto data-[side=bottom]:md:max-w-lg",
          className
        )}
        {...props}
      >
        {grabber ? (
          <div
            data-sheet-handle
            className="mx-auto mt-2 -mb-2 h-[5px] w-9 shrink-0 cursor-grab touch-none rounded-full bg-label-quaternary"
            aria-hidden
          />
        ) : null}
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Cerrar</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-headline text-label",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
