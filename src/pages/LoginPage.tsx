import { useEffect, useState } from 'react'
import { ArrowUpRight, Eye, EyeOff, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { ownerEmail } from '@/lib/auth-config'
import { cn } from '@/lib/utils'

const modules = [
  { name: 'Resumen', detail: 'Gasto del mes · presupuesto' },
  { name: 'Gastos', detail: 'Registro · filtros · historial' },
  { name: 'Categorías', detail: 'Iconos · colores · predicción' },
]

function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="tabular-nums">
      {now.toLocaleTimeString('es-BO', { hour12: false })}
    </span>
  )
}

export function LoginPage() {
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState(ownerEmail ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    if (ownerEmail && email.toLowerCase() !== ownerEmail.toLowerCase()) {
      toast.error('Esta app es de uso personal. Solo el propietario puede iniciar sesión.')
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast.error(error)
  }

  async function handleReset() {
    if (!email) {
      toast.error('Ingresa tu correo')
      return
    }
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) toast.error(error)
    else toast.success('Te enviamos un enlace para restablecer tu contraseña')
  }

  return (
    <div className="relative flex min-h-dvh flex-col text-foreground">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/4 size-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute top-1/3 -right-16 size-64 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="flex items-center justify-between border-b border-border/80 bg-background/50 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span
            className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(92,219,149,0.7)]"
            aria-hidden
          />
          Spendly
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
          En vivo / <LiveClock />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <section className="flex flex-col justify-center">
          <p className="stat-label mb-4">No. 01 · Iniciar sesión</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Bienvenido
            <br />
            <span className="text-primary">de vuelta.</span>
          </h1>

          <form onSubmit={handleLogin} className="mt-10 space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="stat-label">
                01 Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(ownerEmail)}
                required
                className={cn(
                  'h-12 w-full rounded-xl border border-border/60 bg-secondary/80 px-4 text-base outline-none transition-shadow duration-200',
                  'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25',
                  ownerEmail && 'text-muted-foreground',
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="stat-label">
                  02 Contraseña
                </label>
                <button
                  type="button"
                  className="stat-label cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <span className="inline-flex items-center gap-1">
                      <EyeOff className="size-3" /> Ocultar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3" /> Mostrar
                    </span>
                  )}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-border/60 bg-secondary/80 px-4 text-base outline-none transition-shadow duration-200 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="stat-label cursor-pointer text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pressable flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_rgba(92,219,149,0.28)] hover:bg-primary/90 disabled:opacity-60"
            >
              <span>{loading ? 'Entrando...' : 'Iniciar sesión'}</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
          </form>
        </section>

        <aside className="hidden flex-col justify-center border-l border-border pl-10 lg:flex">
          <p className="stat-label mb-6">Módulos · en vivo</p>
          <ul className="space-y-0 divide-y divide-border">
            {modules.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-wide uppercase">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="56" height="20" viewBox="0 0 56 20" className="text-primary" aria-hidden>
                    <path
                      d="M1 14 L10 10 L18 12 L28 6 L38 9 L47 4 L55 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] text-primary uppercase">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Activo
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-2 border-t border-border pt-6">
            <p className="stat-label text-primary">Acceso restringido</p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Consola personal de gastos. El acceso se valida con Supabase Auth
              {ownerEmail ? ` para ${ownerEmail}.` : '.'}
            </p>
          </div>
        </aside>
      </main>

      <footer className="flex flex-col gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="inline-flex items-center gap-2 tracking-[0.08em] uppercase">
          <Lock className="size-3" />
          Sesión cifrada · Supabase Auth
        </p>
        <p className="inline-flex items-center gap-2 tracking-[0.08em] uppercase">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          Todos los sistemas normales
        </p>
      </footer>
    </div>
  )
}
