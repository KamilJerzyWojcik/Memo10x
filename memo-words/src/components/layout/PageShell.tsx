import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageShellProps {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return <div className={cn('flex w-full flex-col gap-10', className)}>{children}</div>
}


