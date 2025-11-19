import type { CardDto } from '@/types/cards'
import { useId, useMemo } from 'react'
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
  const initials = useMemo(() => card.sourceText.slice(0, 2).toUpperCase(), [card.sourceText])

  return (
    <li
      className={cn(
        'group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#161024]/85 p-6 shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[var(--shadow-lg)]',
        highlight ? 'border-primary/60 shadow-[0_0_0_1px_rgba(255,122,92,0.3)]' : '',
      )}
      aria-busy={busy ? 'true' : undefined}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          highlight ? 'opacity-100' : '',
        )}
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(255, 122, 92, 0.2), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255, 92, 69, 0.15), transparent 50%)',
        }}
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-lg font-semibold text-primary-foreground shadow-lg transition-all',
              highlight ? 'ring-2 ring-primary/70' : '',
            )}
            aria-hidden
          >
            {initials}
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">{card.sourceText}</div>
            <div className="text-base text-muted-foreground">{card.targetText}</div>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground lg:items-end">
          <div className="text-xs uppercase tracking-wider text-muted-foreground/80">
            <div>Utw. {formatDateTime(card.createdAt)}</div>
            <div>Akt. {formatDateTime(card.updatedAt)}</div>
          </div>
          {!confirming ? (
            <div className="flex flex-wrap gap-2">
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
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-warning/40 bg-warning/15 px-3 py-2 text-xs text-warning-foreground"
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


