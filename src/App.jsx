import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import IncomePage from './pages/IncomePage'
import ExpensesPage from './pages/ExpensesPage'
import CategoriesPage from './pages/CategoriesPage'
import NotificationsPage from './pages/NotificationsPage'
import FilterPage from './pages/FilterPage'
import { ToastProvider } from './context/ToastContext'
import ProfilePage from './pages/ProfilePage'


function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
    </div>
  )
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  return !token ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider> 
         <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login"        element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/register"     element={<PublicRoute><AuthPage /></PublicRoute>} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/income"        element={<IncomePage />} />
              <Route path="/expenses"      element={<ExpensesPage />} />
              <Route path="/categories"    element={<CategoriesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/filter"        element={<FilterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
       </ToastProvider>
     </AuthProvider>
    </ThemeProvider>
  )
}
