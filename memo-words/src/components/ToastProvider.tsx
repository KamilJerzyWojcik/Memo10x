import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, action?: ToastAction) => {
    const id = idRef.current++;
    const toast: Toast = { id, type, message, action };
    setToasts(prev => [...prev, toast]);
    // Auto-hide after 6s if no action
    if (!action) {
      setTimeout(() => remove(id), 6000);
    }
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 1000,
        }}>
          {toasts.map(t => (
            <div key={t.id} role="status" aria-live="polite" style={{
              minWidth: 280,
              maxWidth: 420,
              padding: '12px 16px',
              borderRadius: 8,
              color: '#111',
              background: t.type === 'error' ? '#ffd1d1' :
                          t.type === 'warning' ? '#ffe9b3' :
                          t.type === 'success' ? '#c9f7d3' : '#e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span>{t.message}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {t.action ? (
                    <button
                      onClick={() => { t.action?.onClick(); remove(t.id); }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #222',
                        background: '#fff'
                      }}
                    >
                      {t.action.label}
                    </button>
                  ) : null}
                  <button
                    aria-label="Zamknij"
                    onClick={() => remove(t.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}


