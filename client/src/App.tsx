import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import POS from './pages/POS'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import { LoadingSpinner } from './components'
import { useAuth } from './contexts/AuthContext'
import type { UserRole } from '../../shared/types'

interface NavItem {
  path: string
  label: string
  element: ReactNode
  roles: UserRole[]
}

// Single source for both the nav and the route table, so a link can never point
// at a page the same role is forbidden from opening (CAP-1).
const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', element: <Dashboard />, roles: ['admin', 'manager'] },
  { path: '/inventory', label: 'Inventory', element: <Inventory />, roles: ['admin', 'manager'] },
  { path: '/pos', label: 'Point of Sale', element: <POS />, roles: ['admin', 'cashier', 'manager'] },
  {
    path: '/transactions',
    label: 'Transactions',
    element: <Transactions />,
    roles: ['admin', 'cashier', 'manager']
  }
]

function landingFor(role: UserRole): string {
  return role === 'cashier' ? '/pos' : '/'
}

// A denied role gets an explicit refusal rather than a redirect, which also
// removes any chance of a redirect loop on a mistyped URL.
function ProtectedRoute({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, ready } = useAuth()

  if (!ready) return <LoadingSpinner label="Loading session..." />
  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.role)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-lg font-semibold text-slate-800">Access denied</p>
        <p className="text-sm text-slate-500 mt-1">
          Your role ({user.role}) does not have permission to view this page.
        </p>
        <Link
          to={landingFor(user.role)}
          className="inline-block mt-4 text-sm text-brand hover:text-brand-strong"
        >
          Go to {landingFor(user.role) === '/pos' ? 'Point of Sale' : 'Dashboard'}
        </Link>
      </div>
    )
  }

  return <>{children}</>
}

function App() {
  const location = useLocation()
  const { user, ready, logout } = useAuth()

  if (!ready) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <LoadingSpinner label="Loading session..." />
      </div>
    )
  }

  // Unauthenticated users see only the login page.
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navigation */}
      <nav className="bg-ink">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-accent">Cube Tech POS</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-brand text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center pl-2 border-l border-slate-700">
                <span className="hidden md:inline text-sm text-slate-300 mr-3">
                  {user.email} · {user.role}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Routes>
          <Route path="/login" element={<Navigate to={landingFor(user.role)} replace />} />
          {NAV_ITEMS.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={<ProtectedRoute roles={item.roles}>{item.element}</ProtectedRoute>}
            />
          ))}
          <Route path="*" element={<Navigate to={landingFor(user.role)} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
