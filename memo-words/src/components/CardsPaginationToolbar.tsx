import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PageSize } from '@/types/cards'
import { usePagination } from '@/hooks/usePagination'

export interface CardsPaginationToolbarProps {
  page: number
  pageSize: PageSize
  total: number
  allowedPageSizes: readonly PageSize[]
  disabled?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: PageSize) => void
}

export default function CardsPaginationToolbar({
  page,
  pageSize,
  total,
  allowedPageSizes,
  disabled,
  onPageChange,
  onPageSizeChange,
}: CardsPaginationToolbarProps) {
  const { lastPage, pages, canPrev, canNext } = usePagination({ page, pageSize, total, around: 2 })

  return (
    <div className="flex w-full flex-col items-center justify-between gap-6 rounded-[40px] border border-white/10 bg-[#0c0715]/80 px-6 py-4 text-sm text-muted-foreground shadow-[var(--shadow-md)] lg:flex-row">
      {/* Sekcja Rozmiaru Strony */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
          Rozmiar strony
        </div>
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {allowedPageSizes.map((size) => {
            const active = size === pageSize
            return (
              <button
                key={size}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onPageSizeChange(size)}
                className={cn(
                  'min-w-[2.5rem] rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40',
                  active
                    ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(255,122,92,0.35)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sekcja Paginacji i Info */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <nav aria-label="Paginacja" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || !canPrev}
            onClick={() => onPageChange(page - 1)}
            aria-label="Poprzednia strona"
            className="h-8 w-8 p-0"
          >
            ‹
          </Button>
          
          <div className="flex items-center gap-1">
            {pages.map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'ghost'}
                size="sm"
                disabled={disabled}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 min-w-[2rem] px-2",
                  p === page && "shadow-[0_4px_12px_rgba(255,122,92,0.35)]"
                )}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || !canNext}
            onClick={() => onPageChange(page + 1)}
            aria-label="Następna strona"
            className="h-8 w-8 p-0"
          >
            ›
          </Button>
        </nav>

        <div className="hidden h-4 w-px bg-white/10 sm:block" />

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
          <span>
            {page}/{lastPage}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span>{total} fiszek</span>
        </div>
      </div>
    </div>
  )
}

