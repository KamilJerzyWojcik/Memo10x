import type { PageSize } from '../types/cards';

export interface CardsToolbarProps {
  pageSize: PageSize;
  allowedPageSizes: readonly PageSize[];
  disabled?: boolean;
  onPageSizeChange: (size: PageSize) => void;
  onAdd: () => void;
}

export default function CardsToolbar(props: CardsToolbarProps) {
  const { pageSize, allowedPageSizes, disabled, onPageSizeChange, onAdd } = props;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label>
        Rozmiar strony:{' '}
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          aria-label="Rozmiar strony"
        >
          {allowedPageSizes.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <button
        onClick={onAdd}
        disabled={disabled}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #222', background: '#fff' }}
      >
        Dodaj
      </button>
    </div>
  );
}


