import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastAction {
  label: string
  onClick: () => void
}

const variantMap: Record<ToastType, 'default' | 'success' | 'warning' | 'destructive'> = {
  info: 'default',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
}

export function useAppToast() {
  const { toast } = useToast()

  const showToast = useCallback(
    (type: ToastType, message: string, action?: ToastAction) => {
      toast({
        title: message,
        variant: variantMap[type],
        action: action ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              action.onClick()
            }}
          >
            {action.label}
          </Button>
        ) : undefined,
      })
    },
    [toast],
  )

  return { showToast }
}


