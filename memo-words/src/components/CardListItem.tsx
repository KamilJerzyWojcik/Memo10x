import type { CardDto } from '../types/cards';
import { useId } from 'react';
import { formatDateTime } from '../utils/format';

export interface CardListItemProps {
  card: CardDto;
  confirming: boolean;
  busy?: boolean;
  autoFocusConfirm?: boolean;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
}

export default function CardListItem(props: CardListItemProps) {
  const { card, confirming, busy, autoFocusConfirm, onEdit, onRequestDelete, onCancelDelete, onConfirmDelete } = props;
  const dialogDescId = useId();

  return (
    <li style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8 }} aria-busy={busy ? 'true' : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{card.sourceText}</div>
          <div style={{ color: '#475569' }}>{card.targetText}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div>Utw: {formatDateTime(card.createdAt)}</div>
            <div>Akt: {formatDateTime(card.updatedAt)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!confirming ? (
              <>
                <button
                  onClick={() => onEdit(card.id)}
                  disabled={busy}
                  style={btnStyle(busy)}
                  aria-label="Edytuj kartę"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => onRequestDelete(card.id)}
                  disabled={busy}
                  style={btnStyle(busy)}
                  aria-label="Usuń kartę"
                >
                  Usuń
                </button>
              </>
            ) : (
              <div
                role="alertdialog"
                aria-label="Potwierdzenie usunięcia"
                aria-describedby={dialogDescId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  borderRadius: 8,
                  padding: '6px 8px',
                }}
              >
                <span id={dialogDescId} style={{ fontSize: 12, color: '#9a3412' }}>
                  Tej operacji nie można cofnąć.
                </span>
                <button
                  onClick={() => onCancelDelete(card.id)}
                  disabled={busy}
                  style={btnStyle(busy)}
                  aria-label="Anuluj usunięcie"
                  autoFocus={autoFocusConfirm === true}
                >
                  Anuluj
                </button>
                <button
                  onClick={() => onConfirmDelete(card.id)}
                  disabled={busy}
                  style={{ ...btnStyle(busy), background: '#ef4444', color: '#fff', borderColor: '#991b1b' }}
                  aria-label="Potwierdź usunięcie"
                >
                  Tak, usuń
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function btnStyle(disabled?: boolean): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #222',
    background: disabled ? '#f1f5f9' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}


