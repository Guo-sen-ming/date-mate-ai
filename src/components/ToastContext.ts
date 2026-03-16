import { createContext, useContext } from 'react'

type ToastType = 'error' | 'success'

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

export const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}
