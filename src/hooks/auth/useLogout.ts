/**
 * ============================================
 * HOOK: useLogout - Lógica de Cierre de Sesión
 * ============================================
 *
 * Hook personalizado que maneja toda la lógica de logout.
 * Separación de responsabilidades: SOLO lógica, sin UI.
 *
 * CARACTERÍSTICAS:
 * - ✅ Estado de loading (isLoggingOut)
 * - ✅ Invalidación de queries antes de logout
 * - ✅ Toasts con feedback visual completo
 * - ✅ Logging profesional
 * - ✅ router.replace() en lugar de push()
 * - ✅ Error handling robusto
 * - ✅ Callbacks opcionales (onBeforeLogout, onAfterLogout)
 * - ✅ Confirmación opcional
 */

'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  showLoggingOutToast,
  showLogoutErrorToast,
  showLogoutToast
} from '@/components/toasts/custom-toasts'
import { debugLog, errorLog, successLog } from '@/lib/utils/logger'
import { useLogoutMutation } from './useAuthMutations'

// ============================================
// TYPES
// ============================================

interface UseLogoutOptions {
  /** Mostrar confirmación antes de cerrar sesión */
  requireConfirmation?: boolean
  /** Mostrar toast de despedida */
  showToast?: boolean
  /** Ruta de redirección (default: /login) */
  redirectTo?: string
  /** Callback antes de logout (útil para guardar estado) */
  onBeforeLogout?: () => void | Promise<void>
  /** Callback después de logout exitoso */
  onAfterLogout?: () => void
}

interface UseLogoutReturn {
  /** Función para ejecutar logout */
  logout: () => Promise<void>
  /** Estado de loading durante logout */
  isLoggingOut: boolean
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para manejar logout con feedback completo
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout({
 *   showToast: true,
 *   redirectTo: '/login'
 * })
 *
 * <button onClick={logout} disabled={isLoggingOut}>
 *   {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
 * </button>
 * ```
 */
export function useLogout(options: UseLogoutOptions = {}): UseLogoutReturn {
  const {
    requireConfirmation = false,
    showToast = true,
    redirectTo = '/login',
    onBeforeLogout,
    onAfterLogout,
  } = options

  const router = useRouter()
  const queryClient = useQueryClient()
  const logoutMutation = useLogoutMutation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  /**
   * Ejecutar logout con feedback completo
   */
  const logout = useCallback(async () => {
    // Evitar múltiples ejecuciones simultáneas
    if (isLoggingOut) {
      debugLog('⚠️ Logout ya en progreso, ignorando nueva invocación')
      return
    }

    // Confirmación (si está habilitada)
    if (requireConfirmation) {
      const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?')
      if (!confirmed) {
        debugLog('❌ Logout cancelado por el usuario')
        return
      }
    }

    try {
      setIsLoggingOut(true)
      debugLog('🚪 Iniciando proceso de logout...', { redirectTo, showToast })

      // Callback pre-logout (ej: guardar estado, cancelar requests)
      if (onBeforeLogout) {
        debugLog('🔄 Ejecutando callback pre-logout...')
        await onBeforeLogout()
      }

      // Toast de loading (solo si showToast está habilitado)
      let loadingToastId: string | number | undefined
      if (showToast) {
        loadingToastId = showLoggingOutToast()
      }

      // ✅ ORDEN CORRECTO:
      // 1. Logout en Supabase (limpia cookies del servidor)
      debugLog('🔐 Ejecutando signOut en Supabase...')
      await logoutMutation.mutateAsync()
      // El mutation ya hace queryClient.clear() en onSuccess

      // 2. Limpiar almacenamiento local
      debugLog('🧹 Limpiando localStorage y sessionStorage...')
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()

      // Limpiar toast de loading
      if (loadingToastId) {
        toast.dismiss(loadingToastId)
      }

      // Toast de éxito (despedida)
      if (showToast) {
        showLogoutToast()
      }

      successLog('Logout completado exitosamente')

      // Callback post-logout
      if (onAfterLogout) {
        debugLog('✅ Ejecutando callback post-logout...')
        onAfterLogout()
      }

      // Navegación (usar replace para evitar volver atrás)
      debugLog(`🧭 Redirigiendo a ${redirectTo} (replace)...`)

      // ✅ SOLUCIÓN DEFINITIVA: Hard reload para garantizar estado limpio
      // window.location.href fuerza recarga completa, limpiando TODO el estado de React
      window.location.href = redirectTo

    } catch (error) {
      errorLog('logout-hook', error)

      // Toast de error
      if (showToast) {
        showLogoutErrorToast()
      }

      // Re-lanzar error para que el componente pueda manejarlo si es necesario
      throw error
    } finally {
      setIsLoggingOut(false)
    }
  }, [
    isLoggingOut,
    requireConfirmation,
    showToast,
    redirectTo,
    onBeforeLogout,
    onAfterLogout,
    queryClient,
    logoutMutation,
    router,
  ])

  return {
    logout,
    isLoggingOut,
  }
}
