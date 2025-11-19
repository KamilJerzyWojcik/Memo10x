export interface AiGenerateButtonProps {
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function AiGenerateButton(props: AiGenerateButtonProps) {
  const { loading, disabled, onClick } = props;
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-live="polite"
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid #222',
        background: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {loading ? (
        <span
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            border: '2px solid #cbd5e1',
            borderTopColor: '#334155',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : null}
      <span>{loading ? 'Generowanie…' : 'Generuj'}</span>
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </button>
  );
}


