import type { PageSize } from '@/types/cards'
import { cn } from '@/lib/utils'

export interface CardsToolbarProps {
  pageSize: PageSize
  allowedPageSizes: readonly PageSize[]
  disabled?: boolean
  onPageSizeChange: (size: PageSize) => void
}

export default function CardsToolbar({ pageSize, allowedPageSizes, disabled, onPageSizeChange }: CardsToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-[40px] border border-white/10 bg-[#0c0715]/80 px-6 py-4 text-sm text-muted-foreground shadow-[var(--shadow-md)]">
      <div className="font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">Rozmiar strony</div>
      <div className="flex flex-wrap gap-2 rounded-full bg-white/5 p-1">
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
                'min-w-12 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-40',
                active
                  ? 'bg-primary text-primary-foreground shadow-[0_12px_25px_rgba(255,122,92,0.35)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}


