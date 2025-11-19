import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { CardDto, PageSize, PagedResultDto } from '@/types/cards'
import { getCards, deleteCard } from '@/services/cardsApi'
import LoadingSpinner from '@/components/LoadingSpinner'
import Paginator from '@/components/Paginator'
import EmptyState from '@/components/EmptyState'
import { ApiError } from '@/services/apiClient'
import CardListItem from '@/components/CardListItem'
import CardsToolbar from '@/components/CardsToolbar'
import { Button } from '@/components/ui/button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useAppToast } from '@/hooks/useAppToast'

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: PageSize = 10;
const ALLOWED_PAGE_SIZES: PageSize[] = [10, 50, 100];

export default function CardsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useAppToast()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CardDto[]>([])
  const [total, setTotal] = useState(0)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const [page, setPage] = useState<number>(DEFAULT_PAGE)
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  // Wyczyść query string z URL przy pierwszym wejściu (zachowując state)
  useEffect(() => {
    if (location.search) {
      navigate('/cards', { replace: true, state: location.state });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const state = location.state as { highlightId?: string } | null;
    if (!state?.highlightId) return;
    setHighlightId(state.highlightId);
    const { highlightId: _, ...rest } = state;
    navigate(location.pathname, {
      replace: true,
      state: Object.keys(rest).length ? rest : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => setHighlightId(null), 1200);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  useEffect(() => {
    let aborted = false;
    const ac = new AbortController();
    setLoading(true);
    getCards({ page, pageSize })
      .then((res: PagedResultDto<CardDto>) => {
        if (aborted) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        if (aborted) return;
        if (err instanceof ApiError) {
          if (err.status === 400) {
            showToast('warning', 'Nieprawidłowe parametry listy', {
              label: 'Przywróć domyślne',
              onClick: () => {
                setPage(DEFAULT_PAGE);
                setPageSize(DEFAULT_PAGE_SIZE);
                setReloadTick(x => x + 1);
              },
            });
            return;
          }
          // 5xx i inne
          showToast('error', 'Nie udało się pobrać. Spróbuj ponownie.', {
            label: 'Ponów',
            onClick: () => setReloadTick(x => x + 1),
          });
          return;
        }
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', {
          label: 'Ponów',
          onClick: () => setReloadTick(x => x + 1),
        });
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => {
      aborted = true;
      ac.abort();
    };
  }, [page, pageSize, reloadTick, showToast]);

  const onPageChange = useCallback((nextPage: number) => {
    if (nextPage < 1) return;
    setPage(nextPage);
  }, []);

  const onPageSizeChange = useCallback((next: PageSize) => {
    setPage(1);
    setPageSize(next);
  }, []);

  const onEdit = useCallback((id: string) => {
    navigate(`/cards/${encodeURIComponent(id)}/edit`);
  }, [navigate]);

  const onRequestDelete = useCallback((id: string) => {
    setConfirmingId(id);
  }, []);

  const onCancelDelete = useCallback(() => {
    setConfirmingId(null);
  }, []);

  const onConfirmDelete = useCallback(async (id: string) => {
    setDeletingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await deleteCard(id);
      setItems(prev => prev.filter(x => x.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      setConfirmingId(null);

      // Opcjonalna sugestia powrotu na poprzednią stronę, jeśli lista pusta i page > 1
      setTimeout(() => {
        if (items.length === 1 && page > 1) {
          showToast('info', 'Brak elementów na tej stronie.', {
            label: `Przejdź do ${page - 1}`,
            onClick: () => setPage(page - 1),
          });
        }
      }, 0);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          showToast('warning', 'Karta nie istnieje. Odświeżono.', {
            label: 'Odśwież',
            onClick: () => setReloadTick(x => x + 1),
          });
          setReloadTick(x => x + 1);
        } else {
          showToast('error', 'Nie udało się usunąć. Spróbuj ponownie.', {
            label: 'Ponów',
            onClick: () => onConfirmDelete(id),
          });
        }
      } else {
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', {
          label: 'Ponów',
          onClick: () => onConfirmDelete(id),
        });
      }
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [items.length, page, showToast]);

  return (
    <>
      <ListPageLayout
        title="Lista kart"
        description="Zarządzaj słówkami i tłumaczeniami w jednym miejscu."
        primaryAction={
          <Button size="lg" onClick={() => navigate('/cards/add')}>
            Dodaj kartę
          </Button>
        }
        toolbar={<CardsToolbar pageSize={pageSize} allowedPageSizes={ALLOWED_PAGE_SIZES} disabled={loading} onPageSizeChange={onPageSizeChange} />}
        footer={
          <>
            <Paginator page={page} pageSize={pageSize} total={total} disabled={loading} onPageChange={onPageChange} />
            <div className="text-sm text-muted-foreground">Razem: {total}</div>
          </>
        }
      >
        {items.length === 0 ? (
          <div className="space-y-4">
            <EmptyState title="Brak kart" description="Dodaj pierwszą kartę, aby rozpocząć naukę." />
            {page > 1 ? (
              <div className="flex justify-center">
                <Button variant="ghost" onClick={() => setPage(page - 1)}>
                  Przejdź do poprzedniej strony
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="grid list-none gap-4 p-0">
            {items.map((card) => (
              <CardListItem
                key={card.id}
                card={card}
                highlight={highlightId === card.id}
                confirming={confirmingId === card.id}
                busy={deletingIds.has(card.id)}
                autoFocusConfirm={confirmingId === card.id}
                onEdit={onEdit}
                onRequestDelete={onRequestDelete}
                onCancelDelete={onCancelDelete}
                onConfirmDelete={onConfirmDelete}
              />
            ))}
          </ul>
        )}
      </ListPageLayout>
      <LoadingSpinner show={loading} />
    </>
  )
}


