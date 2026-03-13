'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Clock, LogOut, MousePointer2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface IdleWarningModalProps {
  isOpen: boolean
  remainingSeconds: number
  level: 'info' | 'warning' | 'critical'
  isLoggingOut?: boolean
  onKeepAlive: () => void
  onLogout?: () => void
}

const LEVEL_CONFIG = {
  info: {
    title: 'Inactividad detectada',
    icon: Clock,
    gradient: 'from-gray-800 via-gray-700 to-gray-900',
    iconBg: 'bg-gray-700',
    borderColor: 'border-gray-600',
    message: 'Detectamos que has estado inactivo por un tiempo.',
  },
  warning: {
    title: 'âš ï¸ Tu sesión está por expirar',
    icon: AlertTriangle,
    gradient: 'from-red-700 via-red-600 to-red-800',
    iconBg: 'bg-red-600',
    borderColor: 'border-red-500',
    message: 'Por seguridad, cerraremos tu sesión pronto si no detectamos actividad.',
  },
  critical: {
    title: 'ðŸš¨ Tu sesión está por expirar',
    icon: AlertTriangle,
    gradient: 'from-red-700 via-red-600 to-red-800',
    iconBg: 'bg-red-600',
    borderColor: 'border-red-500',
    message: 'Por seguridad, cerraremos tu sesión pronto si no detectamos actividad.',
  },
}

export function IdleWarningModal({
  isOpen,
  remainingSeconds,
  level,
  isLoggingOut = false,
  onKeepAlive,
  onLogout,
}: IdleWarningModalProps) {
  const [countdown, setCountdown] = useState(remainingSeconds)
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false)
  const [isClosingSession, setIsClosingSession] = useState(false)
  const config = LEVEL_CONFIG[level]
  const Icon = config.icon

  // Inicializar countdown cuando se abre el modal
  useEffect(() => {
    if (isOpen && remainingSeconds > 0) {
      setCountdown(remainingSeconds)
      setHasStartedCountdown(true)
    }
  }, [isOpen, remainingSeconds])

  // Countdown timer - SOLO depende de isOpen, NO de countdown
  useEffect(() => {
    if (!isOpen) {
      setHasStartedCountdown(false)
      return
    }


    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 0
        }
        const newValue = prev - 1
        // Solo loggear cada 5 segundos para reducir ruido
        if (newValue % 5 === 0 || newValue <= 5) {
        }
        return newValue
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isOpen])

  // ðŸš¨ CRÃTICO: Cerrar sesión automáticamente cuando llegue a 0 (SOLO si ya empezó countdown)
  useEffect(() => {
    if (countdown === 0 && hasStartedCountdown && isOpen && onLogout && !isLoggingOut && !isClosingSession) {
      setIsClosingSession(true)
      // Guardar razón de logout para mostrar pantalla explicativa
      sessionStorage.setItem('logout_reason', 'inactivity')
      sessionStorage.setItem('logout_timestamp', Date.now().toString())
      onLogout()
    }
  }, [countdown, hasStartedCountdown, isOpen, onLogout, isLoggingOut, isClosingSession])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={onKeepAlive}
          />

          {/* Modal - CENTRADO ABSOLUTO */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border-2 ${config.borderColor}`}>
                {/* Header con gradiente RyR */}
                <div className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} px-6 py-4`}>
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white leading-tight">{config.title}</h3>
                      <p className="text-sm text-white/90 leading-tight">Sistema de seguridad</p>
                    </div>
                  </div>
                </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Logo RyR - MÁS VISIBLE */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: level === 'critical' ? [0, -3, 3, -3, 3, 0] : 0,
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    rotate: {
                      duration: 0.5,
                      repeat: level === 'critical' ? Infinity : 0,
                      repeatDelay: 2
                    }
                  }}
                  className="flex justify-center mb-2"
                >
                  <div className="relative w-32 h-24">
                    <Image
                      src="/images/logo1-dark.png"
                      alt="RyR Constructora"
                      width={128}
                      height={96}
                      className="w-full h-full object-contain"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                      }}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                </motion.div>

                {/* Mensaje */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  {config.message}
                </p>

                {/* Countdown o Loading State */}
                <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                  {isClosingSession ? (
                    <>
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <div className="text-center">
                        <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                          Cerrando sesión...
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Un momento por favor
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="text-center">
                        <div className="text-3xl font-bold tabular-nums bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {minutes > 0 ? `${minutes} minuto${minutes !== 1 ? 's' : ''}` : `${seconds} segundos`}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Barra de progreso - Colores RyR */}
                <div className="relative h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-inner">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-lg"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(countdown / remainingSeconds) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>

                {/* Acciones - Botón RyR */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: isClosingSession ? 1 : 1.02 }}
                    whileTap={{ scale: isClosingSession ? 1 : 0.98 }}
                    onClick={onKeepAlive}
                    disabled={isLoggingOut || isClosingSession}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white font-semibold hover:from-red-800 hover:via-red-700 hover:to-red-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MousePointer2 className="w-5 h-5" />
                    Mantener sesión activa
                  </motion.button>

                  {onLogout && (
                    <motion.button
                      whileHover={{ scale: (isLoggingOut || isClosingSession) ? 1 : 1.02 }}
                      whileTap={{ scale: (isLoggingOut || isClosingSession) ? 1 : 0.98 }}
                      onClick={onLogout}
                      disabled={isLoggingOut || isClosingSession}
                      className="px-4 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[56px]"
                      title={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión ahora"}
                    >
                      {isLoggingOut ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LogOut className="w-5 h-5" />
                      )}
                    </motion.button>
                  )}
                </div>

                {/* Info adicional - Colores RyR */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                  <Clock className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    <strong>Medida de seguridad:</strong> Tu sesión se cierra automáticamente después de 1 hora de inactividad para proteger tu información.
                  </p>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
