export default function LoadingSpinner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.2)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 999,
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '6px solid #cbd5e1',
        borderTopColor: '#334155',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}


