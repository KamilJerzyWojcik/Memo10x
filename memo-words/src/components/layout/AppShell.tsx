import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AppShellProps {
  title?: string
  user?: { initials: string; email: string }
  onLogin?: () => void
  onLogout?: () => void
  children: ReactNode
}

export function AppShell({ title = 'MemoWords', user, onLogin, onLogout, children }: AppShellProps) {
  const handleLogin = () => {
    onLogin?.()
  }
  const handleLogout = () => {
    onLogout?.()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-bg-subtle">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-semibold">
              MW
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">MemoWords</p>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user.initials}
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
      <main className={cn('mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8')}>{children}</main>
    </div>
  )
}


