import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  secondaryContent?: ReactNode
  className?: string
}

export function PageHeader({ title, description, primaryAction, secondaryContent, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 p-6 shadow-[var(--shadow-sm)]', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">MemoWords</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="text-base text-muted-foreground">{description}</p> : null}
        </div>
        {primaryAction ? <div className="flex justify-end">{primaryAction}</div> : null}
      </div>
      {secondaryContent ? <div className="border-t border-border/60 pt-4">{secondaryContent}</div> : null}
    </header>
  )
}


