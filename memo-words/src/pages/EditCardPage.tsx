import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { CardDto } from '@/types/cards'
import CardForm from '@/components/CardForm'
import LoadingSpinner from '@/components/LoadingSpinner'
import AiGenerateButton from '@/components/AiGenerateButton'
import { ApiError } from '@/services/apiClient'
import { getCard, updateCard } from '@/services/cardsApi'
import { translate } from '@/services/aiApi'
import { FormPageLayout } from '@/components/layout/FormPageLayout'
import { useAppToast } from '@/hooks/useAppToast'

type GenerateState = 'idle' | 'loading' | 'error';

type FormErrors = {
  sourceText?: string;
  targetText?: string;
};

const MIN_LEN = 1;
const MAX_LEN = 500;

export default function EditCardPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useAppToast()

  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [generateState, setGenerateState] = useState<GenerateState>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const sourceRef = useRef<HTMLTextAreaElement | null>(null);
  const targetRef = useRef<HTMLTextAreaElement | null>(null);
  const initialCardRef = useRef<CardDto | null>(null);
  const requestIdRef = useRef(0);
  const acRef = useRef<AbortController | null>(null);

  const trimmedSource = useMemo(() => sourceText.trim(), [sourceText]);
  const trimmedTarget = useMemo(() => targetText.trim(), [targetText]);

  const sourceCount = useMemo(() => trimmedSource.length, [trimmedSource]);
  const targetCount = useMemo(() => trimmedTarget.length, [trimmedTarget]);

  const dirty = useMemo(() => {
    const initial = initialCardRef.current;
    if (!initial) return false;
    return (
      trimmedSource !== initial.sourceText.trim() ||
      trimmedTarget !== initial.targetText.trim()
    );
  }, [trimmedSource, trimmedTarget]);

  const validateField = useCallback((value: string): string | undefined => {
    const length = value.trim().length;
    if (length < MIN_LEN) return 'Wymagane (min 1 znak).';
    if (length > MAX_LEN) return `Za długie (max ${MAX_LEN} znaków).`;
    return undefined;
  }, []);

  const validateAll = useCallback(() => {
    const nextErrors: FormErrors = {
      sourceText: validateField(sourceText),
      targetText: validateField(targetText),
    };
    setErrors(nextErrors);
    return nextErrors;
  }, [sourceText, targetText, validateField]);

  const applyCard = useCallback((card: CardDto) => {
    initialCardRef.current = card;
    setSourceText(card.sourceText);
    setTargetText(card.targetText);
    setErrors({});
  }, []);

  const handleMissingCard = useCallback(() => {
    showToast('warning', 'Karta nie istnieje lub została usunięta.');
    navigate('/cards', { replace: true });
  }, [navigate, showToast]);

  const loadCard = useCallback(async (cardId: string) => {
    setLoading(true);
    try {
      const fetched = await getCard(cardId);
      applyCard(fetched);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          handleMissingCard();
          return;
        }
        if (err.status === 401) {
          showToast('warning', 'Sesja wygasła – zaloguj się ponownie.');
          return;
        }
        const retry = () => loadCard(cardId);
        showToast('error', 'Nie udało się pobrać karty.', { label: 'Ponów', onClick: retry });
        return;
      }
      showToast('error', 'Błąd sieci. Spróbuj ponownie.', { label: 'Ponów', onClick: () => loadCard(cardId) });
    } finally {
      setLoading(false);
    }
  }, [applyCard, handleMissingCard, showToast]);

  useEffect(() => {
    const cardId = id?.trim();
    if (!cardId) {
      navigate('/cards', { replace: true });
      return;
    }

    const stateCard = (location.state as { card?: CardDto } | null)?.card;
    if (stateCard && stateCard.id === cardId) {
      applyCard(stateCard);
      setLoading(false);
      return;
    }

    loadCard(cardId);
  }, [applyCard, id, loadCard, location.state, navigate]);

  const onSourceChange = useCallback((value: string) => {
    setSourceText(value);
    setErrors(prev => ({ ...prev, sourceText: validateField(value) }));
  }, [validateField]);

  const onTargetChange = useCallback((value: string) => {
    setTargetText(value);
    setErrors(prev => ({ ...prev, targetText: validateField(value) }));
  }, [validateField]);

  const generate = useCallback(async () => {
    if (generateState === 'loading') return;
    const sourceError = validateField(sourceText);
    if (sourceError) {
      setErrors(prev => ({ ...prev, sourceText: sourceError }));
      sourceRef.current?.focus();
      return;
    }

    setGenerateState('loading');
    const myId = ++requestIdRef.current;
    if (acRef.current) {
      try { acRef.current.abort(); } catch { /* ignore */ }
    }
    const controller = new AbortController();
    acRef.current = controller;
    try {
      const res = await translate({ sourceText: trimmedSource }, controller.signal);
      if (requestIdRef.current !== myId) return;
      setTargetText(res.translation);
      setErrors(prev => ({ ...prev, targetText: validateField(res.translation) }));
      setGenerateState('idle');
      setTimeout(() => targetRef.current?.focus(), 0);
    } catch (err) {
      if (requestIdRef.current !== myId) return;
      if (err instanceof DOMException && err.name === 'AbortError') {
        setGenerateState('idle');
        return;
      }
      setGenerateState('error');
      const retry = () => generate();
      if (err instanceof ApiError) {
        if (err.status === 429) {
          showToast('warning', 'Zbyt wiele żądań. Spróbuj ponownie.', { label: 'Ponów', onClick: retry });
        } else if (err.status === 502) {
          showToast('error', 'Błąd usługi AI. Spróbuj ponownie.', { label: 'Ponów', onClick: retry });
        } else if (err.status === 504) {
          showToast('error', 'Przekroczono limit czasu. Spróbuj ponownie.', { label: 'Ponów', onClick: retry });
        } else {
          showToast('error', 'Błąd AI. Spróbuj ponownie.', { label: 'Ponów', onClick: retry });
        }
      } else {
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', { label: 'Ponów', onClick: retry });
      }
    }
  }, [generateState, showToast, sourceText, trimmedSource, validateField]);

  const submit = useCallback(async () => {
    const initial = initialCardRef.current;
    const cardId = id?.trim();
    if (!initial || !cardId) return;

    const currentErrors = validateAll();
    if (currentErrors.sourceText) {
      sourceRef.current?.focus();
      return;
    }
    if (currentErrors.targetText) {
      targetRef.current?.focus();
      return;
    }
    if (!dirty) return;

    const payload: { sourceText?: string; targetText?: string } = {};
    if (trimmedSource !== initial.sourceText.trim()) payload.sourceText = trimmedSource;
    if (trimmedTarget !== initial.targetText.trim()) payload.targetText = trimmedTarget;

    setSubmitting(true);
    try {
      const updated = await updateCard(cardId, payload);
      showToast('success', 'Kartę zaktualizowano.');
      navigate('/cards', { replace: true, state: { highlightId: updated.id } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          showToast('warning', 'Nieprawidłowe dane. Popraw pola.');
          validateAll();
          return;
        }
        if (err.status === 404) {
          handleMissingCard();
          return;
        }
        if (err.status === 401) {
          showToast('warning', 'Sesja wygasła – zaloguj się ponownie.');
          return;
        }
        showToast('error', 'Nie udało się zapisać. Spróbuj ponownie.', { label: 'Ponów', onClick: submit });
      } else {
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', { label: 'Ponów', onClick: submit });
      }
    } finally {
      setSubmitting(false);
    }
  }, [dirty, handleMissingCard, id, navigate, showToast, trimmedSource, trimmedTarget, validateAll]);

  const onCancel = useCallback(() => {
    navigate('/cards');
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (acRef.current) {
        try { acRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  const generating = generateState === 'loading';
  const canSubmit = dirty && !generating && !loading;

  return (
    <>
      <FormPageLayout
        title="Edycja karty"
        description="Wprowadź poprawki do wybranego słówka i zapisz zmiany."
      >
        {loading ? (
          <div className="grid place-items-center py-16 text-muted-foreground">Trwa ładowanie karty...</div>
        ) : (
          <CardForm
            sourceText={sourceText}
            targetText={targetText}
            errors={errors}
            generating={generating}
            disableTargetWhileGenerating
            submitting={submitting}
            submitLabel="Zapisz"
            canSubmit={canSubmit}
            onSourceChange={onSourceChange}
            onTargetChange={onTargetChange}
            onGenerate={generate}
            onSubmit={submit}
            onCancel={onCancel}
            sourceRef={sourceRef}
            targetRef={targetRef}
            sourceCount={sourceCount}
            targetCount={targetCount}
            maxLen={MAX_LEN}
            GenerateButton={AiGenerateButton}
          />
        )}
      </FormPageLayout>
      <LoadingSpinner show={loading || submitting} />
    </>
  )
}


