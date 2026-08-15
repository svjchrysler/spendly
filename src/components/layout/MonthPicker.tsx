import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavBar } from '@/components/layout/NavBar'
import { useMonth } from '@/contexts/MonthContext'
import { capitalize, formatMonthYear } from '@/lib/format'

/**
 * Large title de la pantalla: el mes como título, con la navegación de mes
 * como control trailing de la nav bar — el slot que iOS usa para las acciones
 * de pantalla.
 */
export function MonthMasthead({ eyebrow }: Readonly<{ eyebrow: string }>) {
  const { year, month, goToPreviousMonth, goToNextMonth } = useMonth()

  return (
    <NavBar
      eyebrow={eyebrow}
      title={capitalize(formatMonthYear(year, month))}
      trailing={<MonthStepper onPrevious={goToPreviousMonth} onNext={goToNextMonth} />}
    />
  )
}

export function MonthStepper({
  onPrevious,
  onNext,
}: Readonly<{ onPrevious: () => void; onNext: () => void }>) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon-touch"
        className="cursor-pointer rounded-full text-label-secondary hover:bg-fill-quaternary hover:text-label"
        onClick={onPrevious}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-touch"
        className="cursor-pointer rounded-full text-label-secondary hover:bg-fill-quaternary hover:text-label"
        onClick={onNext}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-5" />
      </Button>
    </>
  )
}
