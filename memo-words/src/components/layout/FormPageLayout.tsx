import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { Section } from './Section'

interface FormPageLayoutProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  children: ReactNode
  aside?: ReactNode
  eyebrow?: string
  emoji?: string
  secondaryAction?: ReactNode
}

export function FormPageLayout({ title, description, primaryAction, children, aside, eyebrow, emoji, secondaryAction }: FormPageLayoutProps) {
  return (
    <PageShell>
      <PageHeader
        title={title}
        description={description}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        eyebrow={eyebrow}
        emoji={emoji}
        secondaryContent={
          <div className="rounded-[32px] border border-white/10 bg-[#140f20]/90 p-6 shadow-[var(--shadow-lg)]">{children}</div>
        }
      />
      {aside ? <Section className="space-y-4">{aside}</Section> : null}
    </PageShell>
  )
}


