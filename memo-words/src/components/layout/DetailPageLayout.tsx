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
  eyebrow?: string
  emoji?: string
}

export function DetailPageLayout({
  title,
  description,
  primaryAction,
  children,
  sidePanel,
  eyebrow,
  emoji,
}: DetailPageLayoutProps) {
  return (
    <PageShell>
      <PageHeader
        title={title}
        description={description}
        primaryAction={primaryAction}
        eyebrow={eyebrow}
        emoji={emoji}
        secondaryContent={sidePanel ? <Section>{sidePanel}</Section> : undefined}
      />
      <Section>{children}</Section>
    </PageShell>
  )
}


