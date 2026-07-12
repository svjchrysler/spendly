import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Toaster } from '@/components/ui/sonner'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { AuthProvider } from '@/contexts/AuthContext'
import { MonthProvider } from '@/contexts/MonthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { queryClient, queryPersistOptions } from '@/lib/query-client'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ExpensesPage = lazy(() =>
  import('@/pages/ExpensesPage').then((module) => ({ default: module.ExpensesPage })),
)
const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
)

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </BrowserRouter>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}
