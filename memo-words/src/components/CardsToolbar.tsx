import type { PageSize } from '@/types/cards'

export interface CardsToolbarProps {
  pageSize: PageSize
  allowedPageSizes: readonly PageSize[]
  disabled?: boolean
  onPageSizeChange: (size: PageSize) => void
}

export default function CardsToolbar({ pageSize, allowedPageSizes, disabled, onPageSizeChange }: CardsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <label className="flex items-center gap-2 font-medium text-foreground">
        Rozmiar strony
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          aria-label="Rozmiar strony"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {allowedPageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}


