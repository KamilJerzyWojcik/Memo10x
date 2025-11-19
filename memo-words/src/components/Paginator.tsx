import { useMemo } from 'react'
import { Button } from '@/components/ui/button'

export interface PaginatorProps {
  page: number
  pageSize: number
  total: number
  disabled?: boolean
  onPageChange: (page: number) => void
}

export default function Paginator({ page, pageSize, total, disabled, onPageChange }: PaginatorProps) {
  const lastPage = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))

  const pages = useMemo(() => {
    const around = 2
    const result: number[] = []
    const start = Math.max(1, page - around)
    const end = Math.min(lastPage, page + around)
    for (let p = start; p <= end; p++) result.push(p)
    if (!result.includes(1)) result.unshift(1)
    if (!result.includes(lastPage)) result.push(lastPage)
    return Array.from(new Set(result)).sort((a, b) => a - b)
  }, [page, lastPage])

  const canPrev = page > 1
  const canNext = page < lastPage

  return (
    <nav aria-label="Paginacja" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" disabled={disabled || !canPrev} onClick={() => onPageChange(page - 1)} aria-label="Poprzednia strona">
        ‹
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'ghost'}
          size="sm"
          disabled={disabled}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
          className="min-w-10"
        >
          {p}
        </Button>
      ))}
      <Button variant="ghost" size="sm" disabled={disabled || !canNext} onClick={() => onPageChange(page + 1)} aria-label="Następna strona">
        ›
      </Button>
      <div aria-hidden className="pl-2">
        Strona {page} z {lastPage}
      </div>
    </nav>
  )
}


