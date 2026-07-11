import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMonth } from '@/contexts/MonthContext'
import { capitalize, formatMonthYear } from '@/lib/format'

export function MonthPicker() {
  const { year, month, goToPreviousMonth, goToNextMonth } = useMonth()

  return (
    <div className="inline-flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 cursor-pointer text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        onClick={goToPreviousMonth}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[7.5rem] text-center text-xs font-medium capitalize tracking-tight text-foreground/90 sm:min-w-[8.5rem] sm:text-sm">
        {capitalize(formatMonthYear(year, month))}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 cursor-pointer text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        onClick={goToNextMonth}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
