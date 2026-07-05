import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMonth } from '@/contexts/MonthContext'
import { capitalize, formatMonthYear } from '@/lib/format'

export function MonthPicker() {
  const { year, month, goToPreviousMonth, goToNextMonth } = useMonth()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer transition-colors duration-200"
        onClick={goToPreviousMonth}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <span className="min-w-[140px] text-center text-sm font-semibold capitalize sm:text-base">
        {capitalize(formatMonthYear(year, month))}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer transition-colors duration-200"
        onClick={goToNextMonth}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  )
}
