/**
 * 🛡️ CONTEXT: Cambios Sin Guardar
 *
 * Gestiona el estado global de cambios sin guardar en la aplicación.
 * Bloquea la navegación cuando hay cambios pendientes.
 */

'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'

import { useModal } from '@/shared/components/modals'

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (value: boolean) => void
  message: string | null
  setMessage: (value: string | null) => void
  onDiscard: (() => Promise<void>) | null
  setOnDiscard: (callback: (() => Promise<void>) | null) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null)

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const onDiscardRef = useRef<(() => Promise<void>) | null>(null)
  const [isNavigating, setIsNavigating] = useState(false) // Flag para evitar beforeunload después de confirmar
  const { confirm } = useModal()
  const pathname = usePathname()

  // Wrapper para setOnDiscard que usa ref
  const setOnDiscard = useCallback((callback: (() => Promise<void>) | null) => {
    onDiscardRef.current = callback
  }, [])

  // Limpiar al cambiar de ruta
  useEffect(() => {
    setHasUnsavedChanges(false)
    setMessage(null)
    onDiscardRef.current = null
    setIsNavigating(false)
  }, [pathname])

  // Protección para cierre de pestaña/navegador
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Solo prevenir si hay cambios Y no estamos navegando intencionalmente
      if (hasUnsavedChanges && !isNavigating) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, isNavigating])

  // Protección para navegación interna
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      // Si es un link interno y hay cambios sin guardar
      if (link && link.href && !link.href.includes(window.location.pathname)) {
        e.preventDefault()
        e.stopPropagation()

        const confirmed = await confirm({
          title: '⚠️ Cambios sin guardar',
          message: message ||
            'Tienes cambios sin guardar.\n\n' +
            'Si sales ahora, se perderán todos los cambios realizados.',
          confirmText: 'Salir sin Guardar',
          cancelText: 'Quedarme Aquí',
          variant: 'warning'
        })

        if (confirmed) {
          // Ejecutar callback de descarte si está registrado
          const discardCallback = onDiscardRef.current
          if (discardCallback && typeof discardCallback === 'function') {
            try {
              await discardCallback()
            } catch (error) {
              console.error('Error al ejecutar onDiscard:', error)
            }
          }

          // Marcar que estamos navegando para evitar beforeunload
          setIsNavigating(true)
          // Limpiar estado antes de navegar
          setHasUnsavedChanges(false)
          setMessage(null)
          // Navegar después de un pequeño delay para que el estado se actualice
          setTimeout(() => {
            window.location.href = link.href
          }, 50)
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [hasUnsavedChanges, message, confirm, setHasUnsavedChanges, setMessage])

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        message,
        setMessage,
        onDiscard: onDiscardRef.current,
        setOnDiscard,
      }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext)
  if (!context) {
    throw new Error('useUnsavedChanges debe usarse dentro de UnsavedChangesProvider')
  }
  return context
}
