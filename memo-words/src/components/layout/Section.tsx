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
    <section
      className={cn(
        'rounded-[30px] border border-white/10 bg-[#120b1b]/80 p-6 shadow-[var(--shadow-md)] ring-1 ring-black/20 backdrop-blur-lg',
        className,
      )}
    >
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


