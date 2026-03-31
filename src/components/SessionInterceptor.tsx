'use client'

import { useEffect, useState } from 'react'

import { SessionClosedByInactivity } from '@/components/auth/SessionClosedByInactivity'

interface SessionInterceptorProps {
  children: React.ReactNode
}

/**
 * Componente que intercepta la aplicación para mostrar pantalla de sesión cerrada
 * ANTES de que se active cualquier contexto de autenticación
 */
export function SessionInterceptor({ children }: SessionInterceptorProps) {
  const [showSessionClosed, setShowSessionClosed] = useState(false)

  useEffect(() => {
    // Verificar si hay logout por inactividad
    const logoutReason = sessionStorage.getItem('logout_reason')
    if (logoutReason === 'inactivity') {
      setShowSessionClosed(true)
    }
  }, [])

  // Si hay sesión cerrada por inactividad, mostrar SOLO esa pantalla
  if (showSessionClosed) {
    return <SessionClosedByInactivity />
  }

  // Caso normal: renderizar la app
  return <>{children}</>
}
