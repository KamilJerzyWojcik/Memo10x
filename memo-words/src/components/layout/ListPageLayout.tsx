import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { Section } from './Section'
import ScrollToTopButton from '@/components/ScrollToTopButton'

interface ListPageLayoutProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  footer?: ReactNode
  eyebrow?: string
  emoji?: string
  heroAside?: ReactNode
}

export function ListPageLayout({
  title,
  description,
  primaryAction,
  toolbar,
  children,
  footer,
  eyebrow,
  emoji,
  heroAside,
}: ListPageLayoutProps) {
  return (
    <PageShell>
      <PageHeader
        title={title}
        description={description}
        primaryAction={primaryAction}
        eyebrow={eyebrow}
        emoji={emoji}
        secondaryContent={heroAside}
      />
      {toolbar ? (
        <Section className="py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">{toolbar}</div>
        </Section>
      ) : null}
      <Section className="space-y-4">{children}</Section>
      {footer ? (
        <Section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">{footer}</Section>
      ) : null}
      <ScrollToTopButton />
    </PageShell>
  )
}


