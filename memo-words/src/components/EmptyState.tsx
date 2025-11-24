import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  emoji?: string
}

export default function EmptyState({
  title,
  description,
  actionLabel = 'Dodaj pierwszą kartę',
  actionTo = '/cards/new',
  emoji = '📮',
}: EmptyStateProps) {
  return (
    <div className="grid place-items-center gap-5 rounded-[32px] border border-dashed border-white/20 bg-white/5 px-10 py-16 text-center text-muted-foreground shadow-[var(--shadow-md)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15 text-4xl">{emoji}</div>
      <div>
        <div className="text-xl font-semibold text-foreground">{title}</div>
        {description ? <p className="mt-2 text-base">{description}</p> : null}
      </div>
      <Button size="lg" className="w-full sm:w-auto" asChild>
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    </div>
  )
}


