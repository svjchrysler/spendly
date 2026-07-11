export function BrandMark({ size = 'md' }: Readonly<{ size?: 'sm' | 'md' }>) {
  const box = size === 'sm' ? 'size-5' : 'size-6'
  return (
    <span
      className={`relative inline-flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-black ring-1 ring-white/10`}
      aria-hidden
    >
      <span className="absolute inset-[22%] rotate-[-38deg] rounded-full bg-white/90" />
      <span className="absolute bottom-[28%] left-[22%] size-[38%] rounded-full bg-[#6fb38a]/90 blur-[1px]" />
      <span className="absolute bottom-[32%] left-[28%] size-[26%] rounded-full bg-[#6fb38a]" />
    </span>
  )
}
