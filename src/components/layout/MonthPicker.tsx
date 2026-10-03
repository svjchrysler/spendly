import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/layout/NavBar'
import { useMonth } from '@/contexts/MonthContext'
import { capitalize, formatMonthYear } from '@/lib/format'
import { tapFeedback } from '@/lib/haptics'

/**
 * Large title de la pantalla con el mes como subtítulo de navegación y el
 * cambio de mes en una cápsula de vidrio, a la altura del subtítulo que
 * controla.
 */
export function MonthMasthead({ title }: Readonly<{ title: string }>) {
  const { year, month, monthKey, direction, goToPreviousMonth, goToNextMonth } = useMonth()

  return (
    <NavBar
      title={title}
      subtitle={capitalize(formatMonthYear(year, month))}
      swapKey={monthKey}
      direction={direction}
      trailing={<MonthStepper onPrevious={goToPreviousMonth} onNext={goToNextMonth} />}
    />
  )
}

export function MonthStepper({
  onPrevious,
  onNext,
}: Readonly<{ onPrevious: () => void; onNext: () => void }>) {
  return (
    <div className="glass-btn glass-capsule" role="group" aria-label="Cambiar de mes">
      <button
        type="button"
        className="pressable inline-flex h-10 w-11 cursor-pointer items-center justify-center rounded-l-full text-label"
        onClick={() => {
          tapFeedback()
          onPrevious()
        }}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-5" strokeWidth={2.25} />
      </button>
      <span className="h-5 w-px bg-separator" aria-hidden />
      <button
        type="button"
        className="pressable inline-flex h-10 w-11 cursor-pointer items-center justify-center rounded-r-full text-label"
        onClick={() => {
          tapFeedback()
          onNext()
        }}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-5" strokeWidth={2.25} />
      </button>
    </div>
  )
}
