import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMonth } from '@/contexts/MonthContext'
import { capitalize, formatMonthYear } from '@/lib/format'

/**
 * Masthead de página: el mes como título editorial en serif itálica,
 * con la navegación de mes integrada a la derecha, cerrado por un hairline.
 */
export function MonthMasthead({ eyebrow }: Readonly<{ eyebrow: string }>) {
  const { year, month, goToPreviousMonth, goToNextMonth } = useMonth()

  return (
    <header className="flex items-end justify-between gap-3 border-b border-border/70 pb-4">
      <div className="min-w-0 space-y-1.5">
        <p className="stat-label">{eyebrow}</p>
        <h1 className="page-title capitalize">{capitalize(formatMonthYear(year, month))}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-1 pb-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 cursor-pointer rounded-full text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          onClick={goToPreviousMonth}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 cursor-pointer rounded-full text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </header>
  )
}
