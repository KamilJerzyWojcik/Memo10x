import type { CardDto } from '@/types/cards'
import { useId } from 'react'
import { formatDateTime } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export interface CardListItemProps {
  card: CardDto
  highlight?: boolean
  confirming: boolean
  busy?: boolean
  autoFocusConfirm?: boolean
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
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: CardListItemProps) {
  const dialogDescId = useId()

  return (
    <li
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        highlight ? 'border-primary/60 ring-1 ring-primary/60 shadow-[0_0_30px_-10px_rgba(255,122,92,0.3)]' : '',
      )}
      aria-busy={busy ? 'true' : undefined}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          highlight ? 'opacity-100' : '',
        )}
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(255, 122, 92, 0.08), transparent 40%), radial-gradient(circle at 100% 100%, rgba(255, 92, 69, 0.05), transparent 40%)',
        }}
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-5">
          <div
            className={cn(
              'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary ring-1 ring-primary/20 transition-all group-hover:scale-105 group-hover:from-primary group-hover:to-primary-strong group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:ring-0',
              highlight ? 'from-primary to-primary-strong text-primary-foreground shadow-lg shadow-primary/20 ring-0' : '',
            )}
            aria-hidden
          >
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {card.sourceText}
            </div>
            <div className="flex items-center gap-2 text-lg font-medium text-primary/90">
              <span className="text-muted-foreground/40">pl</span>
              <span>{card.targetText}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex gap-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            <span title={`Utworzono: ${formatDateTime(card.createdAt)}`}>
              {new Date(card.createdAt).toLocaleDateString()}
            </span>
            {card.updatedAt !== card.createdAt && (
              <span title={`Zaktualizowano: ${formatDateTime(card.updatedAt)}`} className="border-l border-white/10 pl-3">
                Edytowano
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={busy} 
              aria-label="Edytuj kartę"
              className="h-8 hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link to={`/cards/${encodeURIComponent(card.id)}/edit`}>
                Edytuj
              </Link>
            </Button>

            <AlertDialog
              open={!!confirming}
              onOpenChange={(open: boolean) => {
                if (open) onRequestDelete(card.id)
                else onCancelDelete(card.id)
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  aria-label="Usuń kartę"
                  className="h-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  Usuń
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="p-4 sm:p-6">
                <AlertDialogHeader className="gap-2">
                  <AlertDialogTitle>Na pewno usunąć tę kartę?</AlertDialogTitle>
                  <AlertDialogDescription id={dialogDescId}>
                    Tej operacji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => onCancelDelete(card.id)}
                    disabled={busy}
                    autoFocus={autoFocusConfirm === true}
                  >
                    Nie
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onConfirmDelete(card.id)}
                    disabled={busy}
                  >
                    Tak
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </li>
  )
}


