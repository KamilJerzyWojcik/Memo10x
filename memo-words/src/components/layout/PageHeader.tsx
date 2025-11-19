import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  secondaryContent?: ReactNode
  className?: string
  eyebrow?: string
  emoji?: string
}

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
  secondaryContent,
  className,
  eyebrow = 'MemoWords',
  emoji = '🧳',
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#150d1f]/90 via-[#0d0914]/80 to-[#170c22]/90 p-8 shadow-[var(--shadow-lg)]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,122,92,0.2),_transparent_60%)] opacity-90" aria-hidden />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-[100px]" aria-hidden />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          {secondaryAction ? <div className="flex justify-start">{secondaryAction}</div> : null}
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {emoji ? <span className="text-3xl sm:text-4xl">{emoji}</span> : null}
            <span>{eyebrow}</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{title}</h1>
            {description ? <p className="text-base text-muted-foreground sm:text-lg">{description}</p> : null}
          </div>
          {primaryAction ? <div className="flex flex-wrap gap-3">{primaryAction}</div> : null}
        </div>
        {secondaryContent ? (
          <div className="rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-[var(--shadow-md)]">{secondaryContent}</div>
        ) : null}
      </div>
    </header>
  )
}


