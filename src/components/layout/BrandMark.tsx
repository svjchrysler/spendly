export function BrandMark({ size = 'md' }: Readonly<{ size?: 'sm' | 'md' }>) {
  const box = size === 'sm' ? 'size-5' : 'size-6'
  return (
    <span
      className={`relative inline-flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-brand-mark ring-1 ring-foreground/20`}
      aria-hidden
    >
      <span className="absolute inset-[20%] rotate-[-38deg] rounded-full bg-brand-mark-accent/90" />
      <span className="absolute bottom-[26%] left-[20%] size-[40%] rounded-full bg-primary/80 blur-[1px]" />
      <span className="absolute bottom-[30%] left-[26%] size-[28%] rounded-full bg-primary" />
    </span>
  )
}
