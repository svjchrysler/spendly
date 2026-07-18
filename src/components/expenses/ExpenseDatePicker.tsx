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
import { cn } from '@/lib/utils'

interface ExpenseDatePickerProps {
  value: string
  onChange: (value: string) => void
}

function toDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
      <div className="grid w-full min-w-0 grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onChange(toDateString(new Date()))
          }}
          className={cn(
            'pressable h-10 min-w-0 cursor-pointer rounded-xl border text-sm font-medium',
            todaySelected
              ? 'border-primary/45 bg-primary/12 text-foreground'
              : 'border-border/60 bg-muted/15 text-muted-foreground hover:bg-muted/30 hover:text-foreground',
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
            'pressable h-10 min-w-0 cursor-pointer rounded-xl border text-sm font-medium',
            yesterdaySelected
              ? 'border-primary/45 bg-primary/12 text-foreground'
              : 'border-border/60 bg-muted/15 text-muted-foreground hover:bg-muted/30 hover:text-foreground',
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
            'pressable inline-flex h-10 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-xl border px-1.5 text-sm font-medium capitalize',
            otherSelected || open
              ? 'border-primary/45 bg-primary/12 text-foreground'
              : 'border-border/60 bg-muted/15 text-muted-foreground hover:bg-muted/30 hover:text-foreground',
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
          className="absolute right-0 bottom-full z-50 mb-2 w-[17.5rem] rounded-2xl border border-border/80 bg-popover p-3 shadow-xl shadow-[0_20px_40px_var(--shadow-elevated)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView((d) => subMonths(d, 1))}
              className="pressable inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-medium capitalize">
              {format(view, 'MMMM yyyy', { locale: es })}
            </p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setView((d) => addMonths(d, 1))}
              className="pressable inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[10px] font-medium tracking-wide text-muted-foreground"
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
                    'pressable flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm tabular-nums',
                    !inMonth && 'text-muted-foreground/35',
                    inMonth && !selectedDay && 'text-foreground hover:bg-muted/40',
                    selectedDay && 'bg-primary font-semibold text-primary-foreground',
                    today && !selectedDay && 'ring-1 ring-primary/40',
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
