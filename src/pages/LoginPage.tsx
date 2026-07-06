import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatLabel } from '@/components/layout/Stat'
import { useAuth } from '@/contexts/AuthContext'
import { ownerEmail } from '@/lib/auth-config'

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mb-10 flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-primary" />
        <span className="text-lg font-semibold tracking-tight">Spendly</span>
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <StatLabel>Acceso personal</StatLabel>
          <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground">
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
              className="border-border bg-secondary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs text-muted-foreground">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-border bg-secondary/40"
            />
          </div>
          <Button
            type="submit"
            className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            onClick={handleReset}
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </form>
      </div>
    </div>
  )
}
