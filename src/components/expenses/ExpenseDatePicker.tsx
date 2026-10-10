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
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const otherSelected = !todaySelected && !yesterdaySelected

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

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      {/* Segmented control de iOS: tres segmentos en un riel, el elegido sube */}
      <div className="grid w-full min-w-0 grid-cols-3 gap-0.5 rounded-full bg-fill-quaternary p-0.5">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onChange(toDateString(new Date()))
          }}
          className={cn(
            'pressable h-10 min-w-0 cursor-pointer rounded-full text-subhead font-medium transition-colors',
            todaySelected ? 'segment-on text-label' : 'text-label-secondary hover:text-label',
          )}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onChange(toDateString(subDays(new Date(), 1)))
          }}
          className={cn(
            'pressable h-10 min-w-0 cursor-pointer rounded-full text-subhead font-medium transition-colors',
            yesterdaySelected ? 'segment-on text-label' : 'text-label-secondary hover:text-label',
          )}
        >
          Ayer
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Elegir otra fecha"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'pressable inline-flex h-10 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-full px-1.5 text-subhead font-medium capitalize transition-colors',
            otherSelected || open ? 'segment-on text-label' : 'text-label-secondary hover:text-label',
          )}
        >
          <CalendarDays className="size-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{otherSelected ? otherDayLabel(selected) : 'Otra'}</span>
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label="Calendario"
          // Ancho del form con tope: las celdas quedan de ~42px, tocables con el
          // dedo, sin crecer de más en el form sheet de ancho regular
          className="reveal absolute right-0 bottom-full z-50 mb-2 w-full max-w-[21rem] rounded-[1.25rem] bg-sheet-cell p-3 shadow-[0_20px_48px_-12px_var(--shadow-elevated)] ring-1 ring-foreground/5"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView((d) => subMonths(d, 1))}
              className="pressable inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-fill-quaternary"
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
              className="pressable inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-fill-quaternary"
            >
              <ChevronRight className="size-5" strokeWidth={2.25} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-caption-2 font-semibold text-label-tertiary"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
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
                    'pressable flex aspect-square w-full cursor-pointer items-center justify-center rounded-full text-callout tabular-nums',
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
