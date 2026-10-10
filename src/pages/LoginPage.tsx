import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BrandMark } from '@/components/layout/BrandMark'
import { useAuth } from '@/contexts/AuthContext'
import { ownerEmail } from '@/lib/auth-config'
import { cn } from '@/lib/utils'

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

  // Inicio de sesión de iOS: el ícono de la app, los dos campos en un grupo
  // de celdas y una sola acción. El tema sigue al sistema hasta entrar.
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Cascada de entrada: marca → título → bajada → formulario. Es la
            primera pantalla de la app y el orden en que se arma es el orden en
            que hay que leerla. */}
        <section className="stagger flex flex-col items-center text-center">
          <BrandMark size="xl" />
          <h1 className="mt-5 font-display text-large-title text-label">Spendly</h1>
          <p className="mt-1 text-subhead text-label-secondary">Tu registro personal de gastos</p>

          <form onSubmit={handleLogin} className="mt-9 w-full space-y-3 text-left">
            {/* Los inputs van sin outline propio: el foco se ve en el grupo */}
            <div className="list-group focus-within:ring-2 focus-within:ring-primary/35">
              <label htmlFor="email" className="list-row cursor-text">
                <span className="w-24 shrink-0 text-body text-label">Correo</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="nombre@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={Boolean(ownerEmail)}
                  required
                  className={cn(
                    'min-w-0 flex-1 bg-transparent text-body text-label outline-none placeholder:text-label-tertiary',
                    ownerEmail && 'text-label-secondary',
                  )}
                />
              </label>
              <label
                htmlFor="password"
                className="list-row cursor-text"
                style={{ '--row-inset': '1rem' } as React.CSSProperties}
              >
                <span className="w-24 shrink-0 text-body text-label">Contraseña</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Requerida"
                  enterKeyHint="go"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="min-w-0 flex-1 bg-transparent text-body text-label outline-none placeholder:text-label-tertiary"
                />
                <button
                  type="button"
                  className="-my-2 -mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-label-secondary hover:text-label"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pressable mt-3 flex h-[3.25rem] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-headline text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
              {loading ? 'Entrando…' : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="mx-auto flex min-h-11 cursor-pointer items-center px-3 text-subhead text-primary disabled:opacity-50"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
