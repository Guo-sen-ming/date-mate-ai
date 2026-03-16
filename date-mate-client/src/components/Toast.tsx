import { useState, useCallback } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { Cross1Icon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { ToastContext } from './ToastContext'
import styles from './Toast.module.scss'

type ToastType = 'error' | 'success'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="up" duration={4000}>
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={`${styles.root} ${styles[toast.type]}`}
            onOpenChange={(open) => { if (!open) removeToast(toast.id) }}
          >
            <div className={styles.icon}>
              {toast.type === 'error' ? (
                <ExclamationTriangleIcon width={18} height={18} />
              ) : (
                <CheckCircledIcon width={18} height={18} />
              )}
            </div>
            <ToastPrimitive.Description className={styles.message}>
              {toast.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close asChild>
              <button className={styles.closeBtn} aria-label="Close">
                <Cross1Icon width={14} height={14} />
              </button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className={styles.viewport} />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
