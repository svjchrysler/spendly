import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { ownerEmail } from '@/lib/auth-config'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState(ownerEmail ?? '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="text-lg font-semibold tracking-tight">Spendly</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Inicia sesión para gestionar tus gastos
          </p>
        </header>

        <div className="data-panel space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="stat-label">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(ownerEmail)}
                required
                className={cn(
                  'h-10 border-border/80 bg-muted/20 shadow-none',
                  'focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/15',
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="stat-label">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(
                  'h-10 border-border/80 bg-muted/20 shadow-none',
                  'focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary/15',
                )}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full cursor-pointer py-1 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={handleReset}
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
      </div>
    </div>
  )
}
