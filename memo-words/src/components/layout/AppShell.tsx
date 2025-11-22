import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

interface AppShellProps {
  title?: string
  children: ReactNode
}

export function AppShell({ title = 'MemoWords', children }: AppShellProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fullPath = `${location.pathname}${location.search || ''}${location.hash || ''}`
  const initials = user?.email ? (user.email.split('@')[0] || '').slice(0, 2).toUpperCase() : 'MW'

  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: fullPath } })
  }
  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true, state: { returnUrl: fullPath } })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary-strong/20 blur-[160px]" />
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#05030a] via-transparent" />
      </div>
      <div className="relative z-0 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05030a]/80 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary via-primary-strong to-[#ff3f63] text-sm font-bold text-primary-foreground shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute inset-0 bg-white/20 blur-lg" aria-hidden="true" />
                <span className="relative tracking-wide">MW</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/80">MemoWords</p>
                <p className="text-lg font-semibold text-foreground">{title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
            {user ? (
                <>
                  <div className="hidden text-right text-sm sm:block">
                  <div className="font-medium text-foreground">{user.email}</div>
                    <div className="text-muted-foreground">Twoja kolekcja</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-foreground shadow-[var(--shadow-sm)]">
                  {initials}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Wyloguj
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={handleLogin}>
                  Zaloguj się
                </Button>
              )}
            </div>
          </div>
        </header>
        <main className={cn('relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8')}>{children}</main>
      </div>
    </div>
  )
}


