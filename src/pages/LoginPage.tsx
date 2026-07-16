import { useState } from 'react'
import { ArrowUpRight, Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { BrandMark } from '@/components/layout/BrandMark'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { ownerEmail } from '@/lib/auth-config'
import { cn } from '@/lib/utils'

const modules = [
  { name: 'Resumen', detail: 'Gasto del mes · presupuesto' },
  { name: 'Gastos', detail: 'Registro · filtros · historial' },
  { name: 'Categorías', detail: 'Iconos · colores · predicción' },
]

export function LoginPage() {
  const { signIn, resetPassword } = useAuth()
  const { theme, toggleTheme } = useTheme()
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

      <header className="flex items-center justify-between border-b border-border/80 bg-background/50 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <BrandMark size="sm" />
          Spendly
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="pressable inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </header>

      <main className="mx-auto grid w-full flex-1 content-center gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16 xl:px-10">
        <section className="flex flex-col justify-center">
          <h1 className="font-ledger text-pretty text-[2.6rem] leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
            Bienvenido
            <br />
            <span className="text-primary">de vuelta.</span>
          </h1>

          <form onSubmit={handleLogin} className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="stat-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(ownerEmail)}
                required
                className={cn(
                  'h-12 w-full rounded-xl border border-border/60 bg-card/60 px-4 text-base outline-none transition-colors duration-200',
                  'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20',
                  ownerEmail && 'text-muted-foreground',
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="stat-label">
                  Contraseña
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
                className="h-12 w-full rounded-xl border border-border/60 bg-card/60 px-4 text-base outline-none transition-colors duration-200 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
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
              className="pressable flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_28%,transparent)] hover:bg-primary/90 disabled:opacity-60"
            >
              <span>{loading ? 'Entrando…' : 'Iniciar sesión'}</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
          </form>
        </section>

        <aside className="ledger-aside hidden flex-col justify-center lg:flex">
          <p className="stat-label mb-5">Módulos</p>
          <ul className="space-y-0 divide-y divide-border/70">
            {modules.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] text-primary uppercase">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Activo
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </main>

      {/* ponytail: no marketing footer on phone — feels like a website */}
      <footer className="hidden border-t border-border px-6 py-3 text-[11px] text-muted-foreground sm:block pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        Acceso personal · Spendly
      </footer>
    </div>
  )
}
