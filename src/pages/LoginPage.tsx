import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { signIn, signInWithMagicLink, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast.error(error)
  }

  async function handleMagicLink() {
    if (!email) {
      toast.error('Ingresa tu correo')
      return
    }
    setLoading(true)
    const { error } = await signInWithMagicLink(email)
    setLoading(false)
    if (error) toast.error(error)
    else toast.success('Revisa tu bandeja de entrada')
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
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/60 bg-card/80">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/20">
            <Wallet className="size-6 text-secondary" />
          </div>
          <CardTitle className="font-display text-3xl">Spendly</CardTitle>
          <CardDescription>Inicia sesión para gestionar tus gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="password" className="cursor-pointer">
                Contraseña
              </TabsTrigger>
              <TabsTrigger value="magic" className="cursor-pointer">
                Magic link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Iniciar sesión'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full cursor-pointer text-sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Correo</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full cursor-pointer"
                  onClick={handleMagicLink}
                  disabled={loading}
                >
                  Enviar enlace mágico
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="cursor-pointer text-secondary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
