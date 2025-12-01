/**
 * ============================================
 * CUSTOM TOASTS - Diseño Moderno y Atractivo
 * ============================================
 *
 * Toasts personalizados con glassmorphism, gradientes y animaciones.
 * Reemplazan los toasts genéricos de Sonner con diseños únicos.
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    LogIn,
    LogOut,
    ShieldAlert,
    Sparkles,
    XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================
// TOAST: LOGIN EXITOSO
// ============================================

/**
 * Toast de Login Exitoso - Versión Simplificada
 * No requiere datos del usuario para evitar dependencias
 */
export function showLoginSuccessToast() {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-[2px] shadow-2xl shadow-green-500/50'
      >
        {/* Gradiente de fondo animado */}
        <div className='absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 animate-pulse' />

        {/* Patrón de grid */}
        <div className='absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl p-4 min-w-[380px]'>
          <div className='flex items-start gap-4'>
            {/* Icono animado */}
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse' />
                <div className='relative w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg'>
                  <LogIn className='w-6 h-6 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='flex-1 min-w-0'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className='flex items-center gap-2 mb-1'>
                  <h3 className='text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent'>
                    ¡Bienvenido de nuevo!
                  </h3>
                  <Sparkles className='w-4 h-4 text-yellow-500 animate-pulse' />
                </div>
                <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                  Estás siendo redirigido al dashboard de RyR
                </p>
              </motion.div>
            </div>

            {/* Check animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className='w-6 h-6 text-green-600 dark:text-green-400' strokeWidth={2.5} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: SESIÓN POR EXPIRAR (ADVERTENCIA)
// ============================================

interface SessionExpiringToastProps {
  minutes: number
  onKeepAlive: () => void
}

export function showSessionExpiringToast({
  minutes,
  onKeepAlive,
}: SessionExpiringToastProps) {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-[2px] shadow-2xl shadow-orange-500/50'
      >
        {/* Pulso de fondo */}
        <div className='absolute inset-0 bg-gradient-to-r from-amber-400/30 via-orange-400/30 to-red-400/30 animate-pulse' />

        {/* Patrón de advertencia */}
        <div className='absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl p-4 min-w-[420px]'>
          <div className='flex items-start gap-4'>
            {/* Icono animado con pulso */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50 animate-pulse' />
                <div className='relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg'>
                  <Clock className='w-7 h-7 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='flex-1 min-w-0'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className='flex items-center gap-2 mb-1'>
                  <AlertTriangle className='w-5 h-5 text-orange-600 dark:text-orange-400' strokeWidth={2.5} />
                  <h3 className='text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent'>
                    ⚠️ Sesión por expirar
                  </h3>
                </div>
                <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                  Tu sesión se cerrará en{' '}
                  <span className='font-bold text-orange-600 dark:text-orange-400'>
                    {minutes} {minutes === 1 ? 'minuto' : 'minutos'}
                  </span>
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                  Por seguridad, cierra automáticamente por inactividad
                </p>
              </motion.div>

              {/* Botón de acción */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onKeepAlive()
                  toast.dismiss(t)
                }}
                className='mt-3 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2'
              >
                <ShieldAlert className='w-4 h-4' />
                Mantener sesión activa
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 15000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: SESIÓN CERRADA POR INACTIVIDAD
// ============================================

export function showSessionClosedToast() {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-[2px] shadow-2xl shadow-red-500/50'
      >
        {/* Fondo animado */}
        <div className='absolute inset-0 bg-gradient-to-r from-red-400/20 via-rose-400/20 to-pink-400/20 animate-pulse' />

        {/* Patrón */}
        <div className='absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl p-4 min-w-[400px]'>
          <div className='flex items-start gap-4'>
            {/* Icono */}
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 animate-pulse' />
                <div className='relative w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg'>
                  <LogOut className='w-6 h-6 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='flex-1 min-w-0'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className='flex items-center gap-2 mb-1'>
                  <XCircle className='w-5 h-5 text-red-600 dark:text-red-400' strokeWidth={2.5} />
                  <h3 className='text-lg font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent'>
                    Sesión cerrada
                  </h3>
                </div>
                <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                  Por seguridad, tu sesión se cerró automáticamente
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                  Detectamos inactividad prolongada • Vuelve a iniciar sesión
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: SESIÓN MANTENIDA ACTIVA
// ============================================

export function showSessionKeptAliveToast() {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className='relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-xl shadow-blue-500/50'
      >
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-xl p-3 min-w-[300px]'>
          <div className='flex items-center gap-3'>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center'>
                <CheckCircle2 className='w-5 h-5 text-white' strokeWidth={2.5} />
              </div>
            </motion.div>
            <div className='flex-1'>
              <p className='text-sm font-bold text-gray-900 dark:text-white'>
                ✅ Sesión mantenida activa
              </p>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Temporizador reiniciado correctamente
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 3000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: LOGOUT - Cerrando sesión (Loading)
// ============================================

/**
 * Toast de loading durante el proceso de logout
 * Diseño premium con animaciones y glassmorphism
 * Retorna el ID del toast para poder dismiss después
 */
export function showLoggingOutToast() {
  return toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 p-[2px] shadow-2xl shadow-gray-900/50'
      >
        {/* Gradiente animado de fondo */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse' />

        {/* Patrón de grid sutil */}
        <div className='absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl p-4 min-w-[340px]'>
          <div className='flex items-center gap-3'>
            {/* Spinner animado con efecto de salida */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                {/* Glow effect */}
                <div className='absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 animate-pulse' />

                {/* Icono con gradiente */}
                <div className='relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <LogOut className='w-6 h-6 text-white' strokeWidth={2.5} />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Texto con animación */}
            <div className='flex-1 min-w-0'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  Cerrando sesión...
                </h3>
                <p className='text-sm text-gray-700 dark:text-gray-300 mt-0.5'>
                  Finalizando tu sesión de forma segura
                </p>
              </motion.div>
            </div>

            {/* Dots animados */}
            <div className='flex gap-1'>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className='w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600'
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: Infinity, // Se dismisses manualmente
      position: 'top-center',
    }
  )
}

// ============================================
// TOAST: LOGOUT - Sesión cerrada (Success)
// ============================================

/**
 * Toast de despedida después de logout exitoso
 */
export function showLogoutToast() {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 via-blue-700 to-indigo-700 p-[2px] shadow-2xl shadow-blue-500/30'
      >
        {/* Fondo animado */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 animate-pulse' />

        {/* Patrón de grid */}
        <div className='absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl p-4 min-w-[360px]'>
          <div className='flex items-start gap-3'>
            {/* Icono animado con rotación */}
            <motion.div
              initial={{ rotate: 0, scale: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0], scale: 1 }}
              transition={{
                rotate: { duration: 0.5 },
                scale: { type: 'spring', stiffness: 200 }
              }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse' />
                <div className='relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg'>
                  <LogOut className='w-5 h-5 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='flex-1 min-w-0'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  Sesión cerrada
                </h3>
                <p className='text-sm text-gray-700 dark:text-gray-300 mt-0.5'>
                  ¡Hasta pronto! 👋
                </p>
              </motion.div>
            </div>

            {/* Check animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className='w-5 h-5 text-blue-600 dark:text-blue-400' strokeWidth={2.5} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 3000,
      position: 'top-center',
    }
  )
}

// ============================================
// TOAST: LOGOUT - Error (Failure)
// ============================================

/**
 * Toast de error si el logout falla
 */
export function showLogoutErrorToast() {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-[2px] shadow-2xl shadow-red-500/50'
      >
        {/* Contenido */}
        <div className='relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl p-4 min-w-[340px]'>
          <div className='flex items-start gap-3'>
            {/* Icono de error */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50' />
                <div className='relative w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg'>
                  <XCircle className='w-5 h-5 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-bold text-red-600 dark:text-red-400'>
                Error al cerrar sesión
              </h3>
              <p className='text-sm text-gray-700 dark:text-gray-300 mt-0.5'>
                Intenta nuevamente o recarga la página
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 4000,
      position: 'top-center',
    }
  )
}
