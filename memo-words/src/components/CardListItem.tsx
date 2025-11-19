import type { CardDto } from '@/types/cards'
import { useId } from 'react'
import { formatDateTime } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CardListItemProps {
  card: CardDto
  highlight?: boolean
  confirming: boolean
  busy?: boolean
  autoFocusConfirm?: boolean
  onEdit: (id: string) => void
  onRequestDelete: (id: string) => void
  onCancelDelete: (id: string) => void
  onConfirmDelete: (id: string) => void
}

export default function CardListItem({
  card,
  highlight,
  confirming,
  busy,
  autoFocusConfirm,
  onEdit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: CardListItemProps) {
  const dialogDescId = useId()

  return (
    <li
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] transition',
        highlight ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/30' : '',
      )}
      aria-busy={busy ? 'true' : undefined}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-foreground">{card.sourceText}</div>
          <div className="text-base text-muted-foreground">{card.targetText}</div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="text-xs text-muted-foreground sm:text-right">
            <div>Utw: {formatDateTime(card.createdAt)}</div>
            <div>Akt: {formatDateTime(card.updatedAt)}</div>
          </div>
          {!confirming ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => onEdit(card.id)} disabled={busy} aria-label="Edytuj kartę">
                Edytuj
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRequestDelete(card.id)} disabled={busy} aria-label="Usuń kartę">
                Usuń
              </Button>
            </div>
          ) : (
            <div
              role="alertdialog"
              aria-label="Potwierdzenie usunięcia"
              aria-describedby={dialogDescId}
              className="flex items-center gap-2 rounded-xl border border-warning/50 bg-warning/20 px-3 py-2 text-xs text-warning-foreground"
            >
              <span id={dialogDescId}>Tej operacji nie można cofnąć.</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancelDelete(card.id)}
                disabled={busy}
                aria-label="Anuluj usunięcie"
                autoFocus={autoFocusConfirm === true}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onConfirmDelete(card.id)}
                disabled={busy}
                aria-label="Potwierdź usunięcie"
              >
                Tak, usuń
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}


