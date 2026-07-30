const boxBySize = {
  sm: 'size-5 rounded-[5px]',
  md: 'size-6 rounded-[6px]',
  lg: 'size-12 rounded-[10px]',
} as const

/** Marca: moneda mint con ranura sobre campo de tinta. */
export function BrandMark({ size = 'md' }: Readonly<{ size?: keyof typeof boxBySize }>) {
  return (
    <span
      className={`relative inline-flex ${boxBySize[size]} shrink-0 items-center justify-center overflow-hidden bg-brand-mark ring-1 ring-foreground/20`}
      aria-hidden
    >
      <span className="absolute size-[58%] rounded-full bg-primary" />
      <span className="absolute h-[11%] w-[36%] rounded-full bg-brand-mark" />
    </span>
  )
}
