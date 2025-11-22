/* eslint react-refresh/only-export-components: "off" */
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import CardsPage from './pages/CardsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UpdatePasswordPage from './pages/UpdatePasswordPage'
import AddCardPage from './pages/AddCardPage'
import EditCardPage from './pages/EditCardPage'
import { AppShell } from '@/components/layout/AppShell'

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function LoginRoute() {
  const location = useLocation()
  const state = location.state as { returnUrl?: string } | null
  const returnUrl = state?.returnUrl ?? '/'
  return <LoginPage returnUrl={returnUrl} />
}

function RegisterRoute() {
  const location = useLocation()
  const state = location.state as { returnUrl?: string } | null
  const returnUrl = state?.returnUrl ?? '/cards'
  return <RegisterPage returnUrl={returnUrl} />
}

function UpdatePasswordRoute() {
  const location = useLocation()
  const state = location.state as { returnUrl?: string } | null
  const returnUrl = state?.returnUrl ?? '/cards'
  return <UpdatePasswordPage returnUrl={returnUrl} />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/cards" replace />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/cards',
        element: <CardsPage />,
      },
      {
        path: '/cards/new',
        element: <Navigate to="/cards/add" replace />,
      },
      {
        path: '/cards/add',
        element: <AddCardPage />,
      },
      {
        path: '/cards/:id/edit',
        element: <EditCardPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/register',
    element: <RegisterRoute />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/update-password',
    element: <UpdatePasswordRoute />,
  },
])


