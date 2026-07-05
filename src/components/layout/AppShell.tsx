import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Receipt,
  User,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeExpenses } from '@/hooks/useRealtimeExpenses'

const navItems = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/gastos', label: 'Gastos', icon: Receipt },
  { to: '/categorias', label: 'Categorías', icon: FolderOpen },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function AppShell() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  useRealtimeExpenses()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-7xl">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 p-6 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20">
              <Wallet className="size-5 text-secondary" />
            </div>
            <div>
              <p className="font-display text-2xl leading-none">Spendly</p>
              <p className="text-xs text-muted-foreground">Tus gastos, bajo control</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-primary/20 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border pt-4">
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            <Button
              variant="ghost"
              className="w-full cursor-pointer justify-start gap-2 text-muted-foreground transition-colors duration-200 hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <div className="flex min-h-dvh flex-1 flex-col">
          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-8">
            <Outlet />
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-1 cursor-pointer flex-col items-center gap-1 px-2 py-3 text-[11px] font-medium transition-colors duration-200',
                      isActive ? 'text-secondary' : 'text-muted-foreground',
                    )
                  }
                >
                  <Icon className="size-5" />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
