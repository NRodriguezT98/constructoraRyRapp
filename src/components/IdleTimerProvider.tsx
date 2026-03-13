/**
 * ============================================
 * IDLE TIMER PROVIDER - Sistema Profesional
 * ============================================
 *
 * Orquesta el sistema completo de inactividad:
 * - Integra hook useIdleTimer
 * - Maneja modal de advertencias
 * - Coordina toasts informativos
 * - Logs detallados
 *
 * Separación de responsabilidades perfecta.
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { IdleWarningModal } from '@/components/modals/IdleWarningModal'
import { useAuth } from '@/contexts/auth-context'
import { useLogoutMutation } from '@/hooks/auth'
import { useIdleTimer, type IdleWarningLevel } from '@/hooks/useIdleTimer'

export function IdleTimerProvider() {
  const { user } = useAuth()
  const router = useRouter()
  const { mutate: logout } = useLogoutMutation()

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    level: IdleWarningLevel
    remainingSeconds: number
  }>({
    isOpen: false,
    level: 'info',
    remainingSeconds: 0,
  })

  const [isLoggingOut, setIsLoggingOut] = useState(false)



  // Inicializar hook PRIMERO (antes de los callbacks)
  const { keepAlive, getRemainingTime } = useIdleTimer({
    // ✅ PRODUCCIÓN: 60 minutos (1 hora)
    timeoutMinutes: 60,
    modalIsOpen: modalState.isOpen,  // ← Comunicar estado de modal al hook
    onWarning: (level, remainingMinutes, remainingSeconds) => {


      // Mostrar modal para advertencias warning y critical
      // 🚨 IMPORTANTE: Una vez abierta la modal, el hook ignora actividad automática
      //              Solo el botón "Mantener sesión activa" puede cerrarla
      if (level === 'warning' || level === 'critical') {

        setModalState({
          isOpen: true,
          level,
          remainingSeconds,
        })
      }

      // Toast informativo para nivel info - SOLO si no hay modal activa
      if (level === 'info' && !modalState.isOpen) {

        toast.custom(
          (t) => (
            <div className="w-full max-w-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-2xl border border-blue-300 dark:border-blue-700 p-4 flex items-start gap-3 animate-in slide-in-from-right">
              {/* Icono */}
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm mb-1">
                  ⏱️ Inactividad detectada
                </h3>
                <p className="text-blue-100 text-xs leading-relaxed">
                  Tu sesión expirará en <strong className="font-bold">{remainingMinutes} minuto{remainingMinutes !== 1 ? 's' : ''}</strong> si no detectamos actividad.
                </p>
              </div>

              {/* Botón de acción */}
              <button
                onClick={() => {
                  keepAlive()
                  toast.dismiss(t)
                }}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
              >
                Mantener activa
              </button>
            </div>
          ),
          { duration: 10000 }
        )
      }
    },
    onTimeout: () => {

      // Cerrar modal si está abierto
      setModalState(prev => ({ ...prev, isOpen: false }))

      // 🚨 CRÍTICO: Guardar razón de logout para mostrar pantalla explicativa
      sessionStorage.setItem('logout_reason', 'inactivity')
      sessionStorage.setItem('logout_timestamp', Date.now().toString())

      // Ejecutar logout real
      setIsLoggingOut(true)
      logout(undefined, {
        onSuccess: () => {
          window.location.href = '/login'
        },
        onError: () => {
          // Redirigir de todas formas
          window.location.href = '/login'
        }
      })
    }
  })

  // Si no hay usuario, no renderizar nada
  if (!user) {
    return null
  }

  // Renderizar modal de advertencia
  return (
    <IdleWarningModal
      isOpen={modalState.isOpen}
      level={modalState.level}
      remainingSeconds={modalState.remainingSeconds}
      isLoggingOut={isLoggingOut}
      onKeepAlive={() => {
        setModalState({ isOpen: false, level: 'info', remainingSeconds: 0 })
        keepAlive()
      }}
      onLogout={() => {

        setIsLoggingOut(true)

        // Guardar razón de logout para mostrar pantalla explicativa
        sessionStorage.setItem('logout_reason', 'inactivity')
        sessionStorage.setItem('logout_timestamp', Date.now().toString())

        // Ejecutar logout real
        logout(undefined, {
          onSuccess: () => {
            window.location.href = '/login'
          },
          onError: () => {
            setIsLoggingOut(false)
            window.location.href = '/login'
          }
        })
      }}
    />
  )
}
