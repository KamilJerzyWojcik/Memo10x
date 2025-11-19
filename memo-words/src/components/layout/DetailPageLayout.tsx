import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { Section } from './Section'

interface DetailPageLayoutProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  children: ReactNode
  sidePanel?: ReactNode
}

export function DetailPageLayout({ title, description, primaryAction, children, sidePanel }: DetailPageLayoutProps) {
  return (
    <PageShell>
      <PageHeader title={title} description={description} primaryAction={primaryAction} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section>{children}</Section>
        {sidePanel ? <Section>{sidePanel}</Section> : null}
      </div>
    </PageShell>
  )
}


