/**
 * 🎭 MODAL CONTEXT
 *
 * Contexto global para controlar modales de confirmación y alerta.
 * Reemplaza los alert() y confirm() nativos con diseño moderno.
 */

'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

// ==========================================
// TYPES
// ==========================================

export type ModalVariant = 'info' | 'warning' | 'danger' | 'success'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ModalVariant
  icon?: ReactNode
}

export interface AlertOptions {
  title: string
  message: string
  confirmText?: string
  variant?: ModalVariant
  icon?: ReactNode
}

interface ModalContextValue {
  // Confirm modal
  confirm: (options: ConfirmOptions) => Promise<boolean>

  // Alert modal
  alert: (options: AlertOptions) => Promise<void>

  // State interno (para los componentes)
  confirmState: ConfirmState | null
  alertState: AlertState | null
  closeConfirm: (result: boolean) => void
  closeAlert: () => void
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  resolve: (value: boolean) => void
}

interface AlertState extends AlertOptions {
  isOpen: boolean
  resolve: () => void
}

// ==========================================
// CONTEXT
// ==========================================

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [alertState, setAlertState] = useState<AlertState | null>(null)

  // ==========================================
  // CONFIRM
  // ==========================================

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        resolve,
      })
    })
  }, [])

  const closeConfirm = useCallback((result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result)
      setConfirmState(null)
    }
  }, [confirmState])

  // ==========================================
  // ALERT
  // ==========================================

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        ...options,
        isOpen: true,
        resolve,
      })
    })
  }, [])

  const closeAlert = useCallback(() => {
    if (alertState) {
      alertState.resolve()
      setAlertState(null)
    }
  }, [alertState])

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <ModalContext.Provider
      value={{
        confirm,
        alert,
        confirmState,
        alertState,
        closeConfirm,
        closeAlert,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

// ==========================================
// HOOK
// ==========================================

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}
