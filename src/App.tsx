import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { MonthProvider } from '@/contexts/MonthContext'
import { queryClient } from '@/lib/query-client'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { CategoriesPage } from '@/pages/CategoriesPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <MonthProvider>
                    <AppShell />
                  </MonthProvider>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="gastos" element={<ExpensesPage />} />
                <Route path="categorias" element={<CategoriesPage />} />
              </Route>
            </Route>

            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/perfil" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
