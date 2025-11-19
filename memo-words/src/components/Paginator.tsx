import { useMemo } from 'react';

export interface PaginatorProps {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export default function Paginator(props: PaginatorProps) {
  const { page, pageSize, total, disabled, onPageChange } = props;

  const lastPage = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

  const pages = useMemo(() => {
    const around = 2;
    const result: number[] = [];
    const start = Math.max(1, page - around);
    const end = Math.min(lastPage, page + around);
    for (let p = start; p <= end; p++) result.push(p);
    if (!result.includes(1)) result.unshift(1);
    if (!result.includes(lastPage)) result.push(lastPage);
    return Array.from(new Set(result)).sort((a, b) => a - b);
  }, [page, lastPage]);

  const canPrev = page > 1;
  const canNext = page < lastPage;

  return (
    <nav aria-label="Paginacja" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        disabled={disabled || !canPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label="Poprzednia strona"
        style={buttonStyle(disabled || !canPrev)}
      >
        ‹
      </button>
      {pages.map(p => (
        <button
          key={p}
          disabled={disabled || p === page}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
          style={{
            ...buttonStyle(disabled),
            ...(p === page ? { background: '#111', color: '#fff' } : {}),
            minWidth: 36,
          }}
        >
          {p}
        </button>
      ))}
      <button
        disabled={disabled || !canNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Następna strona"
        style={buttonStyle(disabled || !canNext)}
      >
        ›
      </button>
      <div aria-hidden style={{ marginLeft: 8, color: '#64748b' }}>
        Strona {page} z {lastPage}
      </div>
    </nav>
  );
}

function buttonStyle(disabled?: boolean): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #222',
    background: disabled ? '#f1f5f9' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}


