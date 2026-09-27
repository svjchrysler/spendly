import { useState } from 'react'
import { Download, FileDown, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { appCurrency } from '@/lib/currency-config'
import { dbErrorMessage } from '@/lib/db-errors'
import { isSupabaseConfigured } from '@/lib/supabase'

export function ProfileMenu() {
  const { user, signOut } = useAuth()
  const { canInstall, install } = useInstallPrompt()
  const navigate = useNavigate()
  const initials = user?.email?.charAt(0).toUpperCase() ?? 'S'
  const [exporting, setExporting] = useState(false)

  // El export (y su query paginada) se baja recién al tocarlo
  async function handleExport() {
    setExporting(true)
    try {
      const { downloadExpensesCsv } = await import('@/lib/export-expenses')
      const count = await downloadExpensesCsv()
      toast.success(`${count} ${count === 1 ? 'gasto exportado' : 'gastos exportados'}`)
    } catch (error) {
      toast.error(dbErrorMessage(error, 'No se pudo exportar'))
    } finally {
      setExporting(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <p className="stat-label">Perfil</p>
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              <AvatarFallback className="bg-secondary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="truncate text-xs text-muted-foreground">
                Cuenta personal · {appCurrency}
              </p>
            </div>
          </div>
          {!isSupabaseConfigured ? (
            <p className="text-xs text-destructive">
              Configura `.env.local` con tus credenciales de Supabase.
            </p>
          ) : null}
        </div>
        <Separator />
        <div className="p-2">
          {canInstall ? (
            <Button
              variant="ghost"
              className="w-full cursor-pointer justify-start gap-2"
              onClick={() => void install()}
            >
              <Download className="size-4" />
              Instalar app
            </Button>
          ) : null}
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-2"
            disabled={exporting}
            onClick={() => void handleExport()}
          >
            <FileDown className="size-4" />
            {exporting ? 'Exportando…' : 'Exportar gastos (CSV)'}
          </Button>
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
