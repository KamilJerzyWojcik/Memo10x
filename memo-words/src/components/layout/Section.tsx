import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  title?: string
  description?: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({ title, description, aside, children, className }: SectionProps) {
  return (
    <section className={cn('rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[var(--shadow-sm)] backdrop-blur-sm', className)}>
      {(title || description || aside) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? <h2 className="text-xl font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}


