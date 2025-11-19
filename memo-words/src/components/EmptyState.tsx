import { useNavigate } from 'react-router-dom';

export default function EmptyState({
  title,
  description,
  actionLabel = 'Dodaj pierwszą kartę',
  actionTo = '/cards/new',
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: '48px 24px',
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center',
      color: '#334155',
      gap: 12,
    }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
      {description ? <div style={{ fontSize: 14, opacity: 0.8 }}>{description}</div> : null}
      <button
        onClick={() => navigate(actionTo)}
        style={{
          marginTop: 8,
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid #222',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}


