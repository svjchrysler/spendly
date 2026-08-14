import type { ReactNode } from 'react'

/**
 * Set local para el tab bar: pares outline/filled al estilo SF Symbols.
 *
 * lucide no tiene variantes rellenas, y el salto outline → filled al
 * seleccionar es justamente lo que hace que un tab bar se lea como iOS.
 * Vive solo acá: fuera del tab bar seguimos con lucide (ver AGENTS.md).
 *
 * Los cuatro dibujos están normalizados a una caja óptica de ~17×17 centrada
 * en (12,12) sobre la grilla de 24. Sin eso la casa rellena pesa el doble que
 * el tag y la fila se ve despareja.
 */

export type TabIconProps = Readonly<{ active: boolean; className?: string }>
export type TabIcon = (props: TabIconProps) => ReactNode

const OUTLINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const SOLID = { fill: 'currentColor', stroke: 'none' } as const

function TabSvg({ className, children }: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

/* house / house.fill — Resumen. Techo ancho y cuerpo bajo: relleno pesa menos
   que un cubo alto, que es lo que descompensaba la fila. */
const HOUSE = 'M3.6 10.9 12 3.6l8.4 7.3v7.8a1.9 1.9 0 0 1-1.9 1.9H5.5a1.9 1.9 0 0 1-1.9-1.9z'

export function HouseIcon({ active, className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      <path d={HOUSE} {...(active ? SOLID : OUTLINE)} />
    </TabSvg>
  )
}

/* chart.bar / chart.bar.fill — Análisis. El aire entre barras tiene que ser
   mayor al trazo (1.6) o los contornos se tocan y outline == filled. */
const BARS = [
  { x: 2.75, y: 13.6, height: 6.6 },
  { x: 9.75, y: 9.2, height: 11 },
  { x: 16.75, y: 4.4, height: 15.8 },
] as const

export function ChartIcon({ active, className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      {BARS.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width={4.5}
          height={bar.height}
          rx={1.5}
          {...(active ? SOLID : OUTLINE)}
        />
      ))}
    </TabSvg>
  )
}

/* receipt / receipt.fill — Gastos. El relleno usa evenodd para calar las
   líneas: sobre glass un knockout real deja ver el fondo, como en iOS.
   Zigzag de 4 tramos para que las dos esquinas de abajo queden al mismo nivel. */
const RECEIPT =
  'M6.6 3.4H17.4a1.7 1.7 0 0 1 1.7 1.7V20.9l-3.55-1.7-3.55 1.7-3.55-1.7-3.55 1.7V5.1a1.7 1.7 0 0 1 1.7-1.7Z'
const RECEIPT_LINES =
  'M8.3 7.6h7.4a.8.8 0 0 1 0 1.6H8.3a.8.8 0 0 1 0-1.6Z' +
  'M8.3 11h7.4a.8.8 0 0 1 0 1.6H8.3a.8.8 0 0 1 0-1.6Z' +
  'M8.3 14.4h4.6a.8.8 0 0 1 0 1.6H8.3a.8.8 0 0 1 0-1.6Z'

export function ReceiptIcon({ active, className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      {active ? (
        <path d={`${RECEIPT}${RECEIPT_LINES}`} fillRule="evenodd" {...SOLID} />
      ) : (
        <>
          <path d={RECEIPT} {...OUTLINE} />
          <path d="M8.3 8.4h7.4M8.3 11.8h7.4M8.3 15.2h4.6" {...OUTLINE} />
        </>
      )}
    </TabSvg>
  )
}

/* tag / tag.fill — Categorías */
const TAG =
  'M12.527 3.527A1.8 1.8 0 0 0 11.255 3H4.8a1.8 1.8 0 0 0-1.8 1.8v6.455a1.8 1.8 0 0 0 .527 1.273l7.834 7.834a2.183 2.183 0 0 0 3.078 0l5.922-5.922a2.183 2.183 0 0 0 0-3.078z'
const TAG_HOLE = 'M7.95 6.7a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z'

export function TagIcon({ active, className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      {active ? (
        <path d={`${TAG}${TAG_HOLE}`} fillRule="evenodd" {...SOLID} />
      ) : (
        <>
          <path d={TAG} {...OUTLINE} />
          <circle cx={7.95} cy={7.95} r={1.05} {...SOLID} />
        </>
      )}
    </TabSvg>
  )
}
