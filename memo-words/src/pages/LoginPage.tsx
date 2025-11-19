import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const returnUrl = useMemo(() => searchParams.get('returnUrl') ?? '/', [searchParams])

  const goToSupabase = () => {
    window.location.assign(`/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  return (
    <PageShell>
      <PageHeader
        title="Zaloguj się i odzyskaj swoje wyprawy językowe"
        description="Twoje słówka czekają w prywatnej kolekcji. Wejdź ponownie na pokład MemoWords, aby kontynuować naukę bez przestojów."
        eyebrow="Start wyprawy"
        emoji="🧳"
        secondaryContent={
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-muted-foreground">
              Po zalogowaniu wrócisz do:{' '}
              <code className="rounded bg-black/30 px-2 py-1 font-mono text-primary">{returnUrl}</code>
            </div>
            <Button size="lg" className="w-full" onClick={goToSupabase}>
              Przejdź do logowania Supabase
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Placeholder: tutaj pojawi się embed formularza Supabase lub pełny redirect do hostowanej strony logowania.
            </p>
          </div>
        }
      />
    </PageShell>
  )
}


