import { LogOut, Mail, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl">Perfil</h1>
        <p className="text-sm text-muted-foreground">Tu cuenta y configuración</p>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4" />
            {user?.email}
          </div>
          <p className="text-muted-foreground">
            ID: <span className="font-mono text-xs">{user?.id.slice(0, 8)}...</span>
          </p>
        </CardContent>
      </Card>

      {!isSupabaseConfigured ? (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-4 text-sm">
            Configura <code className="rounded bg-muted px-1">.env.local</code> con tus
            credenciales de Supabase para conectar la app.
          </CardContent>
        </Card>
      ) : null}

      <Button
        variant="outline"
        className="w-full cursor-pointer gap-2 text-destructive hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </Button>
    </div>
  )
}
