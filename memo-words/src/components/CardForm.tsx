import type { RefObject } from 'react';

export interface CardFormProps {
  sourceText: string;
  targetText: string;
  errors: { sourceText?: string; targetText?: string };
  generating: boolean;
  disableTargetWhileGenerating?: boolean;
  submitting: boolean;
  onSourceChange(value: string): void;
  onTargetChange(value: string): void;
  onGenerate(): void;
  onSubmit(): void;
  onCancel(): void;
  sourceRef?: RefObject<HTMLTextAreaElement | null>;
  targetRef?: RefObject<HTMLTextAreaElement | null>;
  sourceCount?: number;
  targetCount?: number;
  maxLen?: number;
  GenerateButton?: (props: { loading: boolean; disabled?: boolean; onClick: () => void }) => JSX.Element;
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
  } = props;

  const SubmitDisabled = submitting || !!errors.sourceText || !!errors.targetText;
  const GenerateDisabled = generating || !sourceText.trim();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      style={{ display: 'grid', gap: 16 }}
    >
      <div style={{ display: 'grid', gap: 8 }}>
        <label htmlFor="sourceText">Tekst źródłowy (EN)</label>
        <textarea
          id="sourceText"
          ref={sourceRef}
          rows={4}
          value={sourceText}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-invalid={!!errors.sourceText}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {errors.sourceText ? (
            <div role="alert" style={{ color: '#b91c1c' }}>{errors.sourceText}</div>
          ) : <span />}
          <div style={{ color: '#64748b', fontSize: 12 }}>{(sourceCount ?? sourceText.trim().length)}/{maxLen}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor="targetText">Tłumaczenie (PL)</label>
          {GenerateButton ? (
            <GenerateButton loading={generating} disabled={GenerateDisabled} onClick={onGenerate} />
          ) : null}
        </div>
        <textarea
          id="targetText"
          ref={targetRef}
          rows={4}
          value={targetText}
          readOnly={disableTargetWhileGenerating && generating}
          onChange={(e) => onTargetChange(e.target.value)}
          aria-invalid={!!errors.targetText}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {errors.targetText ? (
            <div role="alert" style={{ color: '#b91c1c' }}>{errors.targetText}</div>
          ) : <span />}
          <div style={{ color: '#64748b', fontSize: 12 }}>{(targetCount ?? targetText.trim().length)}/{maxLen}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          disabled={SubmitDisabled}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #222', background: '#fff' }}
        >
          Dodaj
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}


