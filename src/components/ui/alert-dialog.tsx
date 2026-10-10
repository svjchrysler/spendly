import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useModalDepthRoot } from "@/hooks/useModalDepth"

function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: Readonly<AlertDialogPrimitive.Root.Props>) {
  // La pantalla de atrás retrocede en Z mientras esto esté abierto
  const handleOpenChange = useModalDepthRoot(open, defaultOpen, onOpenChange)

  return (
    <AlertDialogPrimitive.Root
      data-slot="alert-dialog"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      {...props}
    />
  )
}

function AlertDialogTrigger({
  ...props
}: Readonly<AlertDialogPrimitive.Trigger.Props>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: Readonly<AlertDialogPrimitive.Portal.Props>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: Readonly<AlertDialogPrimitive.Backdrop.Props>) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-overlay-strong duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: Readonly<
  AlertDialogPrimitive.Popup.Props & {
    size?: "default" | "sm"
  }
>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          // Alerta de iOS 26/27: angosta, centrada, con las acciones en dos
          // cápsulas lado a lado. Aparece asentándose desde un poco más grande.
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full max-w-[min(19rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-[2rem] bg-popover p-5 text-popover-foreground shadow-[0_24px_64px_-16px_var(--shadow-elevated)] ring-1 ring-foreground/5 duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-110 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid place-items-center gap-1 px-1 pt-1 text-center",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "grid grid-cols-2 gap-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: Readonly<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof AlertDialogPrimitive.Title>>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-headline text-balance text-label",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof AlertDialogPrimitive.Description>>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-subhead text-balance text-label-secondary *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof Button>>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      size="touch"
      className={cn("rounded-full text-body font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  variant = "ghost",
  size = "touch",
  ...props
}: Readonly<
  AlertDialogPrimitive.Close.Props &
    Pick<React.ComponentProps<typeof Button>, "variant" | "size">
>) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(
        "rounded-full bg-fill-tertiary text-body font-semibold text-label hover:bg-fill-secondary",
        className
      )}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
