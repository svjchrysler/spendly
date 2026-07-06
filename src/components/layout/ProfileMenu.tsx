import { LogOut, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { StatLabel } from '@/components/layout/Stat'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

export function ProfileMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const initials = user?.email?.charAt(0).toUpperCase() ?? 'S'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Abrir menú de perfil"
      >
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(18rem,calc(100vw-2rem))] p-0"
      >
        <div className="space-y-4 p-4">
          <StatLabel>Perfil</StatLabel>
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              <AvatarFallback className="bg-secondary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="truncate text-xs text-muted-foreground">
                Cuenta personal
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Mail className="mt-0.5 size-3.5 shrink-0" />
            <span className="break-all">{user?.email}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ID{' '}
            <span className="font-mono text-foreground/70">{user?.id.slice(0, 8)}…</span>
          </p>
          {!isSupabaseConfigured ? (
            <p className="text-xs text-destructive">
              Configura `.env.local` con tus credenciales de Supabase.
            </p>
          ) : null}
        </div>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
