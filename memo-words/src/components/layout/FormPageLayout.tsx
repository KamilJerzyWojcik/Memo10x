import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { Card } from '@/components/ui/card'

interface FormPageLayoutProps {
  title: string
  description?: string
  primaryAction?: ReactNode
  children: ReactNode
  aside?: ReactNode
}

export function FormPageLayout({ title, description, primaryAction, children, aside }: FormPageLayoutProps) {
  return (
    <PageShell>
      <PageHeader title={title} description={description} primaryAction={primaryAction} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-6">{children}</Card>
        {aside ? <div className="space-y-4">{aside}</div> : null}
      </div>
    </PageShell>
  )
}


