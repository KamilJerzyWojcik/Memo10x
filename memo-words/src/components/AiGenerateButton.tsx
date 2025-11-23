import { Button } from '@/components/ui/button'

export interface AiGenerateButtonProps {
  loading: boolean
  disabled?: boolean
  onClick: () => void
}

export default function AiGenerateButton(props: AiGenerateButtonProps) {
  const { loading, disabled, onClick } = props
  const isDisabled = disabled || loading
  return (
    <Button type="button" data-testid="cardform-generate" variant="secondary" size="sm" onClick={onClick} disabled={isDisabled} aria-live="polite">
      {loading ? (
        <span
          data-testid="cardform-generate-spinner"
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
        />
      ) : null}
      <span>{loading ? 'Generowanie…' : 'Generuj'}</span>
    </Button>
  )
}


