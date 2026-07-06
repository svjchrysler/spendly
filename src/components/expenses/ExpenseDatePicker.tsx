import { useRef } from 'react'
import { addDays, format, isToday, isYesterday, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpenseDatePickerProps {
  value: string
  onChange: (value: string) => void
  compact?: boolean
}

function toDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateString(value: string) {
  return parseISO(value)
}

function formatCompactLabel(date: Date) {
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  return format(date, 'EEE d MMM', { locale: es })
}

export function ExpenseDatePicker({ value, onChange, compact = false }: ExpenseDatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const date = parseDateString(value)
  const todaySelected = isToday(date)
  const yesterdaySelected = isYesterday(date)

  function shiftDay(delta: number) {
    onChange(toDateString(addDays(date, delta)))
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Día anterior"
            onClick={() => shiftDay(-1)}
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border/70 bg-muted/20 text-muted-foreground transition-colors hover:bg-muted/35 hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Elegir fecha"
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 text-sm font-medium capitalize transition-colors hover:bg-muted/35"
          >
            {formatCompactLabel(date)}
          </button>

          <button
            type="button"
            aria-label="Día siguiente"
            onClick={() => shiftDay(1)}
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border/70 bg-muted/20 text-muted-foreground transition-colors hover:bg-muted/35 hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(toDateString(new Date()))}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
              todaySelected
                ? 'border-primary/40 bg-primary/10 text-foreground'
                : 'border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
            )}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => onChange(toDateString(subDays(new Date(), 1)))}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
              yesterdaySelected
                ? 'border-primary/40 bg-primary/10 text-foreground'
                : 'border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
            )}
          >
            Ayer
          </button>
        </div>

        <input
          ref={dateInputRef}
          type="date"
          className="sr-only"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-stretch overflow-hidden rounded-xl border border-border/80 bg-muted/20">
        <button
          type="button"
          aria-label="Día anterior"
          onClick={() => shiftDay(-1)}
          className="inline-flex w-10 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          type="button"
          aria-label="Elegir fecha"
          onClick={() => dateInputRef.current?.showPicker?.()}
          className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-x border-border/60 py-3 transition-colors hover:bg-muted/30"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {format(date, 'EEEE', { locale: es })}
          </span>
          <span className="text-2xl font-semibold tabular-nums leading-none tracking-tight">
            {format(date, 'd', { locale: es })}
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {format(date, 'MMMM yyyy', { locale: es })}
          </span>
        </button>

        <button
          type="button"
          aria-label="Día siguiente"
          onClick={() => shiftDay(1)}
          className="inline-flex w-10 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(toDateString(new Date()))}
          className={cn(
            'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
            todaySelected
              ? 'border-primary/40 bg-primary/10 text-foreground'
              : 'border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
          )}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => onChange(toDateString(subDays(new Date(), 1)))}
          className={cn(
            'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
            yesterdaySelected
              ? 'border-primary/40 bg-primary/10 text-foreground'
              : 'border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
          )}
        >
          Ayer
        </button>
      </div>

      <input
        ref={dateInputRef}
        type="date"
        className="sr-only"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
      />
    </div>
  )
}
