export function StatLabel({ children }: { children: React.ReactNode }) {
  return <p className="stat-label">{children}</p>
}

export function StatValue({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`stat-value ${className}`}>{children}</p>
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>
}
