import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CardDto, PageSize, PagedResultDto } from '../types/cards';
import { getCards, deleteCard } from '../services/cardsApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Paginator from '../components/Paginator';
import EmptyState from '../components/EmptyState';
import { ApiError } from '../services/apiClient';
import { useToast } from '../components/ToastProvider';
import CardListItem from '../components/CardListItem';
import CardsToolbar from '../components/CardsToolbar';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: PageSize = 10;
const ALLOWED_PAGE_SIZES: PageSize[] = [10, 50, 100];

function parsePage(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE;
  return Math.floor(n);
}

function parsePageSize(value: string | null): PageSize {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_PAGE_SIZE;
  const size = Math.floor(n) as PageSize;
  return (ALLOWED_PAGE_SIZES as number[]).includes(size) ? size : DEFAULT_PAGE_SIZE;
}

export default function CardsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CardDto[]>([]);
  const [total, setTotal] = useState(0);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const page = useMemo(() => parsePage(searchParams.get('page')), [searchParams]);
  const pageSize = useMemo(() => parsePageSize(searchParams.get('pageSize')), [searchParams]);

  const updateQuery = useCallback((next: { page?: number; pageSize?: PageSize }) => {
    const nextPageSize = next.pageSize ?? pageSize;
    const nextPage = next.page ?? page;
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    params.set('pageSize', String(nextPageSize));
    setSearchParams(params, { replace: true });
  }, [page, pageSize, searchParams, setSearchParams]);

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
              onClick: () => updateQuery({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE }),
            });
            return;
          }
          // 5xx i inne
          showToast('error', 'Nie udało się pobrać. Spróbuj ponownie.', {
            label: 'Ponów',
            onClick: () => updateQuery({}), // wywoła efekt ponownie
          });
          return;
        }
        showToast('error', 'Błąd sieci. Spróbuj ponownie.', {
          label: 'Ponów',
          onClick: () => updateQuery({}),
        });
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => {
      aborted = true;
      ac.abort();
    };
  }, [page, pageSize, showToast, updateQuery]);

  const onPageChange = useCallback((nextPage: number) => {
    if (nextPage < 1) return;
    updateQuery({ page: nextPage });
  }, [updateQuery]);

  const onPageSizeChange = useCallback((next: PageSize) => {
    updateQuery({ page: 1, pageSize: next });
  }, [updateQuery]);

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
            onClick: () => updateQuery({ page: page - 1 }),
          });
        }
      }, 0);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          showToast('warning', 'Karta nie istnieje. Odświeżono.', {
            label: 'Odśwież',
            onClick: () => updateQuery({}),
          });
          updateQuery({});
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
  }, [items.length, page, showToast, updateQuery]);

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Lista kart</h1>
        <CardsToolbar
          pageSize={pageSize}
          allowedPageSizes={ALLOWED_PAGE_SIZES}
          disabled={loading}
          onPageSizeChange={onPageSizeChange}
          onAdd={() => navigate('/cards/new')}
        />
      </header>

      <section>
        {items.length === 0 ? (
          <>
            <EmptyState
              title="Brak kart"
              description="Dodaj pierwszą kartę, aby rozpocząć naukę."
            />
            {page > 1 ? (
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <button
                  onClick={() => updateQuery({ page: page - 1 })}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #222', background: '#fff' }}
                >
                  Przejdź do poprzedniej strony
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {items.map(card => (
              <CardListItem
                key={card.id}
                card={card}
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
      </section>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Paginator
          page={page}
          pageSize={pageSize}
          total={total}
          disabled={loading}
          onPageChange={onPageChange}
        />
        <div style={{ color: '#64748b' }}>
          Razem: {total}
        </div>
      </footer>

      <LoadingSpinner show={loading} />
    </div>
  );
}


