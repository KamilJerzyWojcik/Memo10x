import type { JSX, RefObject } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export interface CardFormProps {
  sourceText: string
  targetText: string
  errors: { sourceText?: string; targetText?: string }
  generating: boolean
  disableTargetWhileGenerating?: boolean
  submitting: boolean
  onSourceChange(value: string): void
  onTargetChange(value: string): void
  onGenerate(): void
  onSubmit(): void
  onCancel(): void
  sourceRef?: RefObject<HTMLTextAreaElement | null>
  targetRef?: RefObject<HTMLTextAreaElement | null>
  sourceCount?: number
  targetCount?: number
  maxLen?: number
  GenerateButton?: (props: { loading: boolean; disabled?: boolean; onClick: () => void }) => JSX.Element
  submitLabel?: string
  canSubmit?: boolean
}

export default function CardForm(props: CardFormProps) {
  const {
    sourceText,
    targetText,
    errors,
    generating,
    disableTargetWhileGenerating = true,
    submitting,
    onSourceChange,
    onTargetChange,
    onGenerate,
    onSubmit,
    onCancel,
    sourceRef,
    targetRef,
    sourceCount,
    targetCount,
    maxLen = 500,
    GenerateButton,
    submitLabel = 'Dodaj',
    canSubmit = true,
  } = props

  const submitDisabled = submitting || !!errors.sourceText || !!errors.targetText || !canSubmit
  const generateDisabled = generating || !sourceText.trim()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="sourceText" className="text-sm font-semibold text-foreground">
          Tekst źródłowy (EN)
        </label>
        <Textarea
          id="sourceText"
          ref={sourceRef}
          value={sourceText}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-invalid={!!errors.sourceText}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {errors.sourceText ? <div role="alert" className="text-destructive">{errors.sourceText}</div> : <span />}
          <div>
            {(sourceCount ?? sourceText.trim().length)}/{maxLen}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="targetText" className="text-sm font-semibold text-foreground">
            Tłumaczenie (PL)
          </label>
          {GenerateButton ? (
            <GenerateButton loading={generating} disabled={generateDisabled} onClick={onGenerate} />
          ) : null}
        </div>
        <Textarea
          id="targetText"
          ref={targetRef}
          value={targetText}
          readOnly={disableTargetWhileGenerating && generating}
          onChange={(e) => onTargetChange(e.target.value)}
          aria-invalid={!!errors.targetText}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {errors.targetText ? <div role="alert" className="text-destructive">{errors.targetText}</div> : <span />}
          <div>
            {(targetCount ?? targetText.trim().length)}/{maxLen}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitDisabled}>
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}


