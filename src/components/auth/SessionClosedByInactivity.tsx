'use client'

import { motion } from 'framer-motion'
import { Clock, Info, LogIn, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function SessionClosedByInactivity() {
  const [timestamp, setTimestamp] = useState<string>('')
  const [minutesAgo, setMinutesAgo] = useState<number>(0)

  useEffect(() => {
    // Leer timestamp del sessionStorage
    const logoutTimestamp = sessionStorage.getItem('logout_timestamp')
    if (logoutTimestamp) {
      const date = new Date(parseInt(logoutTimestamp))
      // Formato 12 horas con AM/PM
      setTimestamp(date.toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }))

      const minutes = Math.floor((Date.now() - parseInt(logoutTimestamp)) / 1000 / 60)
      setMinutesAgo(minutes)
    }

    // Limpiar sessionStorage después de leer
    sessionStorage.removeItem('logout_reason')
    sessionStorage.removeItem('logout_timestamp')
  }, [])

  return (
    <div className="min-h-screen h-screen relative flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Fondo con imagen de construcción (FULL SCREEN - igual que login) */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Image
          src="/images/fondo-login.png"
          alt="Fondo RyR Constructora"
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="eager"
          fetchPriority="low"
          quality={90}
        />
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-black/80 to-gray-900/85" />
      </div>

      {/* Contenido centrado - RESPONSIVE - SIN SCROLL INNECESARIO */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg flex flex-col items-center gap-4 sm:gap-6">
        {/* Logo RyR (más pequeño en móvil) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-48 h-16 sm:w-64 sm:h-20 flex-shrink-0"
        >
          <Image
            src="/images/logo1-dark.png"
            alt="Logo RyR Constructora"
            fill
            sizes="(max-width: 640px) 192px, 256px"
            className="object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.3)) brightness(1.1) contrast(1.1)',
            }}
            priority
            fetchPriority="high"
          />
        </motion.div>

        {/* Modal Card - COLORES RyR (Rojo/Negro) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full flex-shrink-0"
        >
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl border border-red-200/50 dark:border-red-900/50">
            {/* Header con gradiente RyR (Rojo/Negro) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-800 px-4 sm:px-6 py-4 sm:py-5">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0"
                >
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white mb-0.5 leading-tight">
                    Sesión cerrada por inactividad
                  </h1>
                  <p className="text-red-100 text-xs sm:text-sm leading-tight">
                    Por tu seguridad, hemos cerrado tu sesión automáticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal - MÁS COMPACTO */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Explicación principal con colores RyR */}
              <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/50">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">
                    ¿Por qué se cerró mi sesión?
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    Tu sesión se cerró automáticamente después de <strong className="font-bold">1 hora de inactividad</strong> para proteger tu información y la de los clientes.
                  </p>
                </div>
              </div>

              {/* Timestamp del cierre */}
              {timestamp && (
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">
                    Sesión cerrada a las <strong className="text-gray-900 dark:text-white font-semibold">{timestamp}</strong>
                    {minutesAgo > 0 && (
                      <span className="text-gray-500 dark:text-gray-500"> • Hace {minutesAgo} min{minutesAgo !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Cómo funciona - MÁS COMPACTO */}
              <div className="space-y-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                  ¿Cómo funciona el sistema?
                </h3>

                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-tight">Detecta cuando no hay <strong className="font-semibold">ninguna interacción</strong></span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-tight">Recibes <strong className="font-semibold">advertencias</strong> a los 50, 55 y 58 minutos</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-tight">Se cierra <strong className="font-semibold">automáticamente a los 60 minutos</strong></span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-tight">Clic en <strong className="font-semibold">"Mantener sesión activa"</strong> reinicia el contador</span>
                  </li>
                </ul>
              </div>

              {/* Seguridad - Colores RyR */}
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-50 to-gray-50 dark:from-red-950/30 dark:to-gray-950/30 border border-red-200 dark:border-red-900/50">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-red-900 dark:text-red-100 mb-1">
                      Tu seguridad es nuestra prioridad
                    </h4>
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed">
                      Este sistema protege información sensible contra accesos no autorizados cuando dejas tu computadora desatendida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de login - COLORES RyR */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => {
                    // Limpiar sessionStorage específico de logout
                    sessionStorage.removeItem('logout_reason')
                    sessionStorage.removeItem('logout_timestamp')
                    // Navegar al login normal
                    window.location.href = '/login'
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white text-sm sm:text-base font-semibold hover:from-red-800 hover:via-red-700 hover:to-red-900 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Iniciar sesión nuevamente
                </button>
              </motion.div>

              {/* Footer discreto */}
              <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700/50 leading-tight">
                Si necesitas más tiempo, contacta al administrador
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
