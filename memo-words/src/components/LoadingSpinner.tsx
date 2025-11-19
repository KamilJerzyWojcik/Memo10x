export default function LoadingSpinner({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <span className="sr-only">Trwa ładowanie…</span>
    </div>
  )
}


