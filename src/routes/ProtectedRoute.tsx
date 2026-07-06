import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <RouteFallback />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) return <RouteFallback />

  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
