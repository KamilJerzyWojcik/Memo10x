import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const returnUrl = useMemo(() => searchParams.get('returnUrl') ?? '/', [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-bg-subtle">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:px-6">
        <PageShell>
          <Section>
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">MemoWords</p>
                <h1 className="text-3xl font-semibold text-foreground">Logowanie</h1>
                <p className="text-base text-muted-foreground">Brak sesji. Zaloguj się, aby kontynuować naukę słówek.</p>
              </div>
              <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                Po zalogowaniu wrócisz do: <code className="rounded bg-card px-2 py-1 text-foreground">{returnUrl}</code>
              </div>
              <Button size="lg" className="w-full" onClick={() => window.location.assign(`/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`)}>
                Przejdź do logowania Supabase
              </Button>
              <p className="text-xs text-muted-foreground">
                (Placeholder) Tutaj zostanie umieszczony formularz logowania Supabase lub redirect do hostowanej strony logowania.
              </p>
            </div>
          </Section>
        </PageShell>
      </div>
    </div>
  )
}


