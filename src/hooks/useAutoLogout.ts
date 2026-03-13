/**
 * ============================================
 * HOOK: Auto-Logout por Inactividad
 * ============================================
 *
 * Detecta inactividad del usuario y cierra sesión automáticamente.
 * Refactorizado para usar React Query mutations (sin closures obsoletos).
 *
 * CARACTERÃSTICAS:
 * - â±ï¸ 30 minutos de inactividad â†’ Logout automático
 * - ðŸ–±ï¸ Detecta: mouse, teclado, scroll, clicks
 * - âš ï¸ Advertencia 5 minutos antes de logout
 * - âŒ NO cierra sesión al cambiar de pestaña/ventana (no agresivo)
 * - âœ… Usa React Query mutations (sin problemas de closures)
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
    showSessionClosedToast,
    showSessionExpiringToast,
    showSessionKeptAliveToast,
} from '@/components/toasts/custom-toasts'
import { useAuth } from '@/contexts/auth-context'
import { useLogoutMutation } from '@/hooks/auth'

interface UseAutoLogoutOptions {
  /** Minutos de inactividad antes de logout (default: 30) */
  timeoutMinutes?: number
  /** Mostrar advertencia X minutos antes (default: 5) */
  warningMinutes?: number
  /** Activar sistema (default: true) */
  enabled?: boolean
}

export function useAutoLogout(options: UseAutoLogoutOptions = {}) {
  const {
    timeoutMinutes = 30,
    warningMinutes = 5,
    enabled = true,
  } = options

  const { user } = useAuth()
  const logoutMutation = useLogoutMutation() // âœ… Mutación estable de React Query

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  // âœ… Control de visibilidad de página (evitar acumulación de toasts)
  const lastActivityRef = useRef<number>(Date.now())
  const warningShownRef = useRef(false)
  const logoutExecutedRef = useRef(false)
  const pageIsVisibleRef = useRef(true)

  // Convertir minutos a milisegundos
  const TIMEOUT_MS = timeoutMinutes * 60 * 1000
  const WARNING_MS = warningMinutes * 60 * 1000

  /**
   * Ejecutar logout usando mutación de React Query
   * âœ… Sin problemas de closures - mutación es estable
   * âœ… Solo muestra toast si la página está visible Y no se ha mostrado ya
   */
  const executeLogout = useCallback(() => {
    // Evitar múltiples ejecuciones
    if (logoutExecutedRef.current) {
      return
    }

    logoutExecutedRef.current = true

    // Limpiar todos los temporizadores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    // âœ… SOLO mostrar toast UNA VEZ cuando la página está visible
    if (pageIsVisibleRef.current) {
      showSessionClosedToast()
    }

    // âœ… Usar mutación de React Query (siempre actualizada)
    logoutMutation.mutate()
  }, [logoutMutation])

  /**
   * Reiniciar temporizadores
   * Usa useCallback con deps mínimas para evitar recreación constante
   */
  const resetTimers = useCallback(() => {
    // Actualizar última actividad
    lastActivityRef.current = Date.now()
    warningShownRef.current = false

    // Limpiar temporizadores anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    // Ocultar advertencia si estaba visible
    if (showWarning) {
      setShowWarning(false)
    }

    // Configurar advertencia (TIMEOUT_MS - WARNING_MS)
    warningTimeoutRef.current = setTimeout(() => {
      // âœ… SOLO mostrar advertencia si la página está visible
      if (!pageIsVisibleRef.current) {
        return
      }

      // âœ… Solo mostrar advertencia si NO se ha mostrado antes
      if (warningShownRef.current) return
      warningShownRef.current = true
      setShowWarning(true)
      setRemainingSeconds(WARNING_MS / 1000)

      // Countdown cada segundo
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // âœ… Toast con acción para mantener sesión activa (solo UNA VEZ y si página visible)
      showSessionExpiringToast({
        minutes: warningMinutes,
        onKeepAlive: () => {
          warningShownRef.current = false // Permitir futuros warnings

          // Limpiar temporizadores
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
          setShowWarning(false)

          // Reiniciar timers manualmente
          lastActivityRef.current = Date.now()

          warningTimeoutRef.current = setTimeout(() => {
            if (!warningShownRef.current && pageIsVisibleRef.current) {
              setShowWarning(true)
              setRemainingSeconds(WARNING_MS / 1000)
              warningShownRef.current = true
              showSessionExpiringToast({
                minutes: warningMinutes,
                onKeepAlive: () => {},
              })
            }
          }, TIMEOUT_MS - WARNING_MS)

          timeoutRef.current = setTimeout(() => {
            executeLogout()
          }, TIMEOUT_MS)

          showSessionKeptAliveToast()
        },
      })
    }, TIMEOUT_MS - WARNING_MS)

    // Configurar logout automático
    timeoutRef.current = setTimeout(() => {
      executeLogout()
    }, TIMEOUT_MS)
  }, [TIMEOUT_MS, WARNING_MS, warningMinutes, executeLogout, showWarning])

  /**
   * Manejar actividad del usuario
   */
  const handleUserActivity = useCallback(() => {
    // Solo reiniciar si hay usuario autenticado y está habilitado
    if (user && enabled) {
      resetTimers()
    }
  }, [user, enabled, resetTimers])

  useEffect(() => {
    // Solo activar si hay usuario autenticado y está habilitado
    if (!user || !enabled) {
      // âœ… RESETEAR flags cuando no hay usuario (después de logout)
      logoutExecutedRef.current = false
      warningShownRef.current = false
      return
    }

    // âœ… RESETEAR flags al iniciar sesión (nuevo usuario)
    logoutExecutedRef.current = false
    warningShownRef.current = false

    // Iniciar temporizadores SOLO UNA VEZ
    resetTimers()

    // Eventos de actividad del usuario
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ]

    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // âœ… Page Visibility API - Detectar cuando la página vuelve a ser visible
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      pageIsVisibleRef.current = isVisible

      // âŒ NO mostrar toast aquí - ya se mostró en executeLogout()
      // El toast solo debe mostrarse UNA VEZ cuando se ejecuta el logout
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })

      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, enabled, timeoutMinutes, warningMinutes])
  // âš ï¸ NO incluir resetTimers ni handleUserActivity para evitar loops infinitos

  return {
    showWarning,
    remainingSeconds,
    resetTimers: handleUserActivity,
  }
}
