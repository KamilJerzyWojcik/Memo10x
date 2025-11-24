import type { JSX, RefObject } from 'react'
import { useEffect, useId, useRef } from 'react'
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

  const sourceErrorId = useId()
  const targetErrorId = useId()
  const sourceCountId = useId()
  const targetCountId = useId()

  const hasAutoFocusedRef = useRef(false)

  useEffect(() => {
    if (submitting) return
    if (hasAutoFocusedRef.current) return
    if (errors.sourceText && sourceRef?.current) {
      sourceRef.current.focus()
      hasAutoFocusedRef.current = true
      return
    }
    if (errors.targetText && targetRef?.current) {
      targetRef.current.focus()
      hasAutoFocusedRef.current = true
    }
  }, [errors, submitting, sourceRef, targetRef])

  useEffect(() => {
    if (!errors.sourceText && !errors.targetText) {
      hasAutoFocusedRef.current = false
    }
  }, [errors])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-6"
      data-testid="cardform"
    >
      <div className="space-y-2">
        <label htmlFor="sourceText" className="text-sm font-semibold text-foreground">
          Tekst źródłowy (EN)
        </label>
        <Textarea
          id="sourceText"
          data-testid="cardform-source"
          ref={sourceRef}
          value={sourceText}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-invalid={!!errors.sourceText}
          aria-describedby={`${errors.sourceText ? sourceErrorId : ''} ${sourceCountId}`.trim()}
          maxLength={maxLen}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {errors.sourceText ? <div id={sourceErrorId} role="alert" data-testid="cardform-source-error" className="text-destructive">{errors.sourceText}</div> : <span />}
          <div id={sourceCountId} data-testid="cardform-source-count">
            {(sourceCount ?? sourceText.trim().length)}/{maxLen}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3" data-testid="cardform-generate-area">
          <label htmlFor="targetText" className="text-sm font-semibold text-foreground">
            Tłumaczenie (PL)
          </label>
          {GenerateButton ? (
            <GenerateButton loading={generating} disabled={generateDisabled} onClick={onGenerate} />
          ) : null}
        </div>
        <Textarea
          id="targetText"
          data-testid="cardform-target"
          ref={targetRef}
          value={targetText}
          readOnly={disableTargetWhileGenerating && generating}
          onChange={(e) => onTargetChange(e.target.value)}
          aria-invalid={!!errors.targetText}
          aria-describedby={`${errors.targetText ? targetErrorId : ''} ${targetCountId}`.trim()}
          maxLength={maxLen}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {errors.targetText ? <div id={targetErrorId} role="alert" data-testid="cardform-target-error" className="text-destructive">{errors.targetText}</div> : <span />}
          <div id={targetCountId} data-testid="cardform-target-count">
            {(targetCount ?? targetText.trim().length)}/{maxLen}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" data-testid="cardform-submit" disabled={submitDisabled}>
          {submitLabel}
        </Button>
        <Button type="button" data-testid="cardform-cancel" variant="ghost" onClick={onCancel} disabled={submitting}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}


