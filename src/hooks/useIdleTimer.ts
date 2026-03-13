/**
 * ============================================
 * HOOK: Sistema Profesional de Inactividad
 * ============================================
 *
 * Sistema de nivel enterprise con:
 * - ⚠️ Advertencias escalonadas (3 niveles)
 * - 🔔 Modal de advertencia final con countdown
 * - 📊 Tracking detallado de actividad
 * - 🔄 Sistema de "keep alive" robusto
 * - 📝 Logs profesionales
 * - 💾 Estado persistente
 *
 * Sin problemas de closures ni stale references.
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { useLogoutMutation } from '@/hooks/auth'
import { useCallback, useEffect, useRef } from 'react'

export type IdleWarningLevel = 'info' | 'warning' | 'critical'

export interface IdleTimerConfig {
  /** Tiempo total de inactividad en minutos (default: 60) */
  timeoutMinutes?: number
  /** Habilitar sistema (default: true) */
  enabled?: boolean
  /** Si hay una modal de advertencia abierta (default: false) */
  modalIsOpen?: boolean
  /** Callbacks de notificación */
  onWarning?: (level: IdleWarningLevel, remainingMinutes: number, remainingSeconds: number) => void
  onTimeout?: () => void
}

interface IdleTimerState {
  lastActivity: number
  warningShown: { info: boolean; warning: boolean; critical: boolean }
  logoutExecuted: boolean
  pageVisible: boolean
}

const ACTIVITY_EVENTS = [
  'mousedown',
  // 'mousemove', // ❌ Removido: muy costoso (se dispara cientos de veces/seg)
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const

export function useIdleTimer(config: IdleTimerConfig = {}) {
  const {
    timeoutMinutes = 60,
    enabled = true,
    modalIsOpen = false,
    onWarning,
    onTimeout,
  } = config

  const { user } = useAuth()
  const logoutMutation = useLogoutMutation()

  // ✅ Estado en refs para evitar closures
  const stateRef = useRef<IdleTimerState>({
    lastActivity: Date.now(),
    warningShown: { info: false, warning: false, critical: false },
    logoutExecuted: false,
    pageVisible: true,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Convertir a milisegundos
  const TIMEOUT_MS = timeoutMinutes * 60 * 1000

  // Niveles de advertencia (porcentajes del tiempo total)
  // ✅ PRODUCCIÓN: Niveles de advertencia para 60 minutos
  const WARNING_LEVELS = {
    info: 0.833,     // 83.3% del tiempo (50 min en 60 min)
    warning: 0.917,  // 91.7% del tiempo (55 min en 60 min)
    critical: 0.967, // 96.7% del tiempo (58 min en 60 min)
  }

  /**
   * Ejecutar logout con logging detallado
   */
  const executeLogout = useCallback(() => {
    const state = stateRef.current

    if (state.logoutExecuted) {
      return
    }



    state.logoutExecuted = true

    // Limpiar timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    // Guardar motivo de cierre en sessionStorage
    sessionStorage.setItem('logout_reason', 'inactivity')
    sessionStorage.setItem('logout_timestamp', Date.now().toString())

    // Callback opcional
    onTimeout?.()

    // Ejecutar logout
    logoutMutation.mutate()
  }, [logoutMutation, onTimeout])

  /**
   * Verificar nivel de inactividad y mostrar advertencias
   */
  const checkInactivity = useCallback(() => {
    const state = stateRef.current
    const now = Date.now()
    const inactiveTime = now - state.lastActivity
    const progress = inactiveTime / TIMEOUT_MS
    const remainingMs = TIMEOUT_MS - inactiveTime
    const remainingSeconds = Math.floor(remainingMs / 1000)
    const remainingMinutes = Math.ceil(remainingMs / 1000 / 60)



    // Verificar si se superó el tiempo límite
    if (progress >= 1.0) {
      executeLogout()
      return
    }

    // Determinar nivel actual
    let currentLevel: IdleWarningLevel | null = null

    if (progress >= WARNING_LEVELS.critical) {
      currentLevel = 'critical'
      if (!state.warningShown.critical) {
        state.warningShown.critical = true
        onWarning?.('critical', remainingMinutes, remainingSeconds)
      }
    } else if (progress >= WARNING_LEVELS.warning) {
      currentLevel = 'warning'
      if (!state.warningShown.warning) {
        state.warningShown.warning = true
        onWarning?.('warning', remainingMinutes, remainingSeconds)
      }
    } else if (progress >= WARNING_LEVELS.info) {
      currentLevel = 'info'
      // 🚨 NO mostrar advertencia INFO si ya se mostró WARNING o CRITICAL
      if (!state.warningShown.info && !state.warningShown.warning && !state.warningShown.critical) {
        state.warningShown.info = true
        onWarning?.('info', remainingMinutes, remainingSeconds)
      }
    }
  }, [TIMEOUT_MS, WARNING_LEVELS, onWarning, executeLogout])

  /**
   * Reiniciar actividad (llamado por usuario o eventos)
   */
  const resetActivity = useCallback(() => {
    const state = stateRef.current

    // Actualizar estado
    state.lastActivity = Date.now()
    state.warningShown = { info: false, warning: false, critical: false }

    // Limpiar timers antiguos
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    // ✅ PRODUCCIÓN: Verificar cada 15s (buen balance entre precisión y performance)
    const checkInterval = 15000
    checkIntervalRef.current = setInterval(checkInactivity, checkInterval)

    // Timeout de seguridad (por si falla el interval)
    timeoutRef.current = setTimeout(executeLogout, TIMEOUT_MS + 5000)
  }, [checkInactivity, executeLogout, TIMEOUT_MS])

  /**
   * Manejar actividad del usuario
   */
  const handleUserActivity = useCallback(() => {
    if (!user || !enabled) return

    const state = stateRef.current

    // 🚨 Si ya se mostró warning/critical O hay modal abierta, ignorar actividad automática
    // Solo el botón "Mantener sesión activa" puede resetear el timer
    if (state.warningShown.warning || state.warningShown.critical || modalIsOpen) {
      return
    }

    // Throttle agresivo: solo actualizar si pasaron más de 10 segundos
    // (reduce carga de CPU sin afectar UX)
    const now = Date.now()
    if (now - state.lastActivity < 10000) return

    resetActivity()
  }, [user, enabled, modalIsOpen, resetActivity])

  /**
   * API pública: Mantener sesión activa (botón manual)
   */
  const keepAlive = useCallback(() => {
    resetActivity()
  }, [resetActivity])

  /**
   * API pública: Obtener tiempo restante
   */
  const getRemainingTime = useCallback(() => {
    const state = stateRef.current
    const elapsed = Date.now() - state.lastActivity
    const remaining = Math.max(0, TIMEOUT_MS - elapsed)

    return {
      remainingMs: remaining,
      remainingMinutes: Math.ceil(remaining / 1000 / 60),
      remainingSeconds: Math.ceil(remaining / 1000),
      progress: elapsed / TIMEOUT_MS,
    }
  }, [TIMEOUT_MS])

  /**
   * Effect principal: Inicializar y limpiar
   */
  useEffect(() => {
    if (!user || !enabled) {

      // Resetear estado al cerrar sesión
      stateRef.current = {
        lastActivity: Date.now(),
        warningShown: { info: false, warning: false, critical: false },
        logoutExecuted: false,
        pageVisible: true,
      }

      return
    }



    // Resetear estado al iniciar sesión
    stateRef.current.logoutExecuted = false
    stateRef.current.warningShown = { info: false, warning: false, critical: false }

    // Iniciar timers
    resetActivity()

    // Agregar event listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Page Visibility API
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      stateRef.current.pageVisible = isVisible
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })

      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, enabled, timeoutMinutes, modalIsOpen, handleUserActivity, resetActivity, WARNING_LEVELS])

  return {
    keepAlive,
    getRemainingTime,
    resetActivity,
  }
}
