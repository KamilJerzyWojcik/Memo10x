import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { Section } from './Section'

interface ListPageLayoutProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function ListPageLayout({ title, description, primaryAction, toolbar, children, footer }: ListPageLayoutProps) {
  return (
    <PageShell>
      <PageHeader title={title} description={description} primaryAction={primaryAction} />
      <Section>
        <div className="flex flex-col gap-6">
          {toolbar ? <div className="flex flex-wrap items-center justify-between gap-4">{toolbar}</div> : null}
          {children}
        </div>
      </Section>
      {footer ? <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">{footer}</div> : null}
    </PageShell>
  )
}


