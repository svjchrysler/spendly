import { useEffect, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { toDateString } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ExpenseDatePickerProps {
  value: string
  onChange: (value: string) => void
}

function otherDayLabel(date: Date) {
  return format(date, 'd MMM', { locale: es })
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function ExpenseDatePicker({ value, onChange }: Readonly<ExpenseDatePickerProps>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = parseISO(value)
  const [view, setView] = useState(selected)
  const todaySelected = isToday(selected)
  const yesterdaySelected = isYesterday(selected)
  const label = todaySelected ? 'Hoy' : yesterdaySelected ? 'Ayer' : otherDayLabel(selected)

  useEffect(() => {
    if (open) setView(selected)
  }, [open, selected])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(view), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(view), { weekStartsOn: 1 }),
  })

  function pick(date: Date) {
    onChange(toDateString(date))
    setOpen(false)
  }

  const quick =
    'pressable h-9 min-w-0 cursor-pointer rounded-full text-subhead font-medium transition-colors'

  return (
    <div ref={rootRef} className="relative">
      {/*
        La fecha casi siempre es hoy: una píldora sobre el monto alcanza, y la
        fila que ocupaba el selector queda para los gastos frecuentes. El
        `before` estira el área tocable a 44pt sin agrandar la píldora.
      */}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Fecha: ${label}. Cambiar`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'pressable relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-subhead font-medium capitalize transition-colors before:absolute before:-inset-x-1 before:-inset-y-1',
          open ? 'bg-primary/15 text-label' : 'bg-sheet-cell text-label-secondary',
        )}
      >
        <CalendarDays className="size-4 shrink-0 opacity-70" aria-hidden />
        {label}
        <ChevronDown
          className={cn('size-3.5 shrink-0 opacity-60 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Elegir fecha"
          // Abre hacia abajo y centrado bajo la píldora, sobre el resto del
          // form: no empuja nada, así el sheet no cambia de alto con el
          // teclado arriba
          className="reveal absolute top-full left-1/2 z-50 mt-2 w-[calc(100vw-3rem)] max-w-[21rem] -translate-x-1/2 rounded-[1.25rem] bg-sheet-cell p-3 shadow-[0_20px_48px_-12px_var(--shadow-elevated)] ring-1 ring-foreground/5"
        >
          <div className="mb-2 grid grid-cols-2 gap-0.5 rounded-full bg-fill-quaternary p-0.5">
            <button
              type="button"
              onClick={() => pick(new Date())}
              className={cn(quick, todaySelected ? 'segment-on text-label' : 'text-label-secondary')}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => pick(subDays(new Date(), 1))}
              className={cn(
                quick,
                yesterdaySelected ? 'segment-on text-label' : 'text-label-secondary',
              )}
            >
              Ayer
            </button>
          </div>

          <div className="mb-1 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView((d) => subMonths(d, 1))}
              className="pressable inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-fill-quaternary"
            >
              <ChevronLeft className="size-5" strokeWidth={2.25} />
            </button>
            <p className="text-headline text-label capitalize">
              {format(view, 'MMMM yyyy', { locale: es })}
            </p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setView((d) => addMonths(d, 1))}
              className="pressable inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-fill-quaternary"
            >
              <ChevronRight className="size-5" strokeWidth={2.25} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-0.5 text-center text-caption-2 font-semibold text-label-tertiary"
              >
                {day}
              </div>
            ))}
            {days.map((day) => {
              const inMonth = isSameMonth(day, view)
              const selectedDay = isSameDay(day, selected)
              const today = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  className={cn(
                    'pressable flex h-9 w-full cursor-pointer items-center justify-center rounded-full text-callout tabular-nums',
                    !inMonth && 'text-label-quaternary',
                    inMonth && !selectedDay && 'text-label hover:bg-fill-quaternary',
                    selectedDay && 'bg-primary font-semibold text-primary-foreground',
                    today && !selectedDay && 'font-semibold text-primary',
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
