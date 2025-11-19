import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function EmptyState({
  title,
  description,
  actionLabel = 'Dodaj pierwszą kartę',
  actionTo = '/cards/new',
}: {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}) {
  const navigate = useNavigate()
  return (
    <div className="grid place-items-center gap-4 rounded-3xl border border-dashed border-border bg-muted/40 px-8 py-16 text-center text-muted-foreground">
      <div className="text-xl font-semibold text-foreground">{title}</div>
      {description ? <p className="text-base">{description}</p> : null}
      <Button variant="outline" size="lg" onClick={() => navigate(actionTo)}>
        {actionLabel}
      </Button>
    </div>
  )
}


