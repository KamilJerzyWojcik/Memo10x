import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import CardForm from '../components/CardForm';
import AiGenerateButton from '../components/AiGenerateButton';
import { translate } from '../services/aiApi';
import { createCard } from '../services/cardsApi';
import { ApiError } from '../services/apiClient';

type GenerateState = 'idle' | 'loading' | 'error';

const MIN_LEN = 1;
const MAX_LEN = 500;

export default function AddCardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [errors, setErrors] = useState<{ sourceText?: string; targetText?: string }>({});
  const [generateState, setGenerateState] = useState<GenerateState>('idle');
  const [submitting, setSubmitting] = useState(false);

  const requestIdRef = useRef(0);
  const acRef = useRef<AbortController | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement | null>(null);
  const targetRef = useRef<HTMLTextAreaElement | null>(null);

  const trimmedSource = useMemo(() => sourceText.trim(), [sourceText]);
  const trimmedTarget = useMemo(() => targetText.trim(), [targetText]);

  const validateField = useCallback((value: string): string | undefined => {
    const len = value.trim().length;
    if (len < MIN_LEN) return 'Wymagane (min 1 znak).';
    if (len > MAX_LEN) return `Za długie (max ${MAX_LEN} znaków).`;
    return undefined;
  }, []);

  const validateAll = useCallback(() => {
    const nextErrors = {
      sourceText: validateField(sourceText),
      targetText: validateField(targetText),
    };
    setErrors(nextErrors);
    return nextErrors;
  }, [sourceText, targetText, validateField]);

  const onSourceChange = useCallback((v: string) => {
    setSourceText(v);
    setErrors(prev => ({ ...prev, sourceText: validateField(v) }));
  }, [validateField]);

  const onTargetChange = useCallback((v: string) => {
    setTargetText(v);
    setErrors(prev => ({ ...prev, targetText: validateField(v) }));
  }, [validateField]);

  const generate = useCallback(async () => {
    if (generateState === 'loading') return;
    const sourceErr = validateField(sourceText);
    if (sourceErr) {
      setErrors(prev => ({ ...prev, sourceText: sourceErr }));
      sourceRef.current?.focus();
      return;
    }

    setGenerateState('loading');
    const myId = ++requestIdRef.current;
    // Abort previous if any
    if (acRef.current) {
      try { acRef.current.abort(); } catch {}
    }
    acRef.current = new AbortController();
    try {
      const res = await translate({ sourceText: trimmedSource }, acRef.current.signal);
      if (requestIdRef.current !== myId) return;
      setTargetText(res.translation);
      setErrors(prev => ({ ...prev, targetText: validateField(res.translation) }));
      setGenerateState('idle');
      // focus on target
      setTimeout(() => targetRef.current?.focus(), 0);
    } catch (err) {
      if (requestIdRef.current !== myId) return;
      // Swallow abort
      if (typeof err === 'object' && err !== null && 'name' in err && (err as any).name === 'AbortError') {
        setGenerateState('idle');
        return;
      }
      setGenerateState('error');
      if (err instanceof ApiError) {
        if (err.status === 429) {
          showToast('warning', 'Zbyt wiele żądań. Spróbuj ponownie.', { label: 'Ponów', onClick: generate });
        } else if (err.status === 502) {
          showToast('error', 'Błąd usługi AI. Spróbuj ponownie.', { label: 'Ponów', onClick: generate });
        } else if (err.status === 504) {
          showToast('error', 'Przekroczono limit czasu. Spróbuj ponownie.', { label: 'Ponów', onClick: generate });
        } else {
          showToast('error', 'Błąd AI. Spróbuj ponownie.', { label: 'Ponów', onClick: generate });
        }
      } else {
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', { label: 'Ponów', onClick: generate });
      }
    }
  }, [generateState, showToast, sourceText, trimmedSource, validateField]);

  const submit = useCallback(async () => {
    const currentErrors = validateAll();
    if (currentErrors.sourceText || currentErrors.targetText) {
      if (currentErrors.sourceText) {
        sourceRef.current?.focus();
      } else if (currentErrors.targetText) {
        targetRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCard({ sourceText: trimmedSource, targetText: trimmedTarget });
      navigate('/cards', { replace: true, state: { highlightId: created.id } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          showToast('warning', 'Nieprawidłowe dane. Sprawdź pola.', {
            label: 'Pokaż',
            onClick: () => {
              validateAll();
              if (errors.sourceText) {
                sourceRef.current?.focus();
              } else if (errors.targetText) {
                targetRef.current?.focus();
              }
            },
          });
        } else {
          showToast('error', 'Nie udało się zapisać. Spróbuj ponownie.', {
            label: 'Ponów',
            onClick: submit,
          });
        }
      } else {
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', {
          label: 'Ponów',
          onClick: submit,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }, [errors.sourceText, errors.targetText, navigate, showToast, trimmedSource, trimmedTarget, validateAll]);

  const onCancel = useCallback(() => {
    navigate('/cards');
  }, [navigate]);

  const sourceLen = useMemo(() => trimmedSource.length, [trimmedSource]);
  const targetLen = useMemo(() => trimmedTarget.length, [trimmedTarget]);

  const generating = generateState === 'loading';

  useEffect(() => {
    return () => {
      if (acRef.current) {
        try { acRef.current.abort(); } catch {}
      }
    };
  }, []);

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>Dodaj kartę</h1>

      <CardForm
        sourceText={sourceText}
        targetText={targetText}
        errors={errors}
        generating={generating}
        submitting={submitting}
        disableTargetWhileGenerating
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        onGenerate={generate}
        onSubmit={submit}
        onCancel={onCancel}
        sourceRef={sourceRef}
        targetRef={targetRef}
        sourceCount={sourceLen}
        targetCount={targetLen}
        maxLen={MAX_LEN}
        GenerateButton={AiGenerateButton}
      />

      <LoadingSpinner show={submitting} />
    </div>
  );
}
