import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Box, Menu } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import POS from './pages/POS'
import StockMovements from './pages/StockMovements'
import Transactions from './pages/Transactions'
import Receipt from './pages/Receipt'
import Login from './pages/Login'
import { LoadingSpinner, NavDrawer } from './components'
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
  {
    path: '/stock-movements',
    label: 'Stock Movements',
    element: <StockMovements />,
    roles: ['admin', 'manager']
  },
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
          className="inline-block mt-4 rounded-md text-sm text-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
  const [navOpen, setNavOpen] = useState(false)

  // The drawer is a mobile surface: navigating or crossing into desktop
  // widths always leaves it closed.
  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setNavOpen(false)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

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
            <div className="flex flex-1 items-center justify-between gap-1 lg:flex-none lg:justify-start">
              <button
                type="button"
                onClick={() => setNavOpen(true)}
                aria-label="Open navigation"
                aria-expanded={navOpen}
                aria-controls="mobile-nav"
                className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                <Menu size={24} aria-hidden="true" />
              </button>
              <span className="sr-only">celiadon</span>
              <Box size={28} aria-hidden="true" className="text-accent" />
            </div>
            <div className="hidden lg:flex items-center space-x-1 sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
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
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)}>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setNavOpen(false)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink min-h-[44px] ${
                location.pathname === item.path
                  ? 'bg-brand text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="px-3 text-sm text-slate-300 mb-2">
            {user.email} · {user.role}
          </p>
          <button
            type="button"
            onClick={() => {
              setNavOpen(false)
              logout()
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink min-h-[44px]"
          >
            Sign out
          </button>
        </div>
      </NavDrawer>

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
          {/* Contextual only — no nav item. Any authenticated role may sell, so any role may see its receipt. */}
          <Route
            path="/receipts/:id"
            element={
              <ProtectedRoute roles={['admin', 'cashier', 'manager']}>
                <Receipt />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={landingFor(user.role)} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
