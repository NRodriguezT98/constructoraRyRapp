/**
 * ============================================
 * COMPONENTE: InvalidRoleError
 * ============================================
 *
 * Pantalla de error cuando se detecta un rol no válido en el sistema.
 * Muestra información útil y opciones de recuperación.
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES:
 * - Componente: Solo UI presentacional
 * - Hook (useInvalidRoleError): Lógica de negocio
 */

'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, LogOut, Mail, RefreshCw, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { useInvalidRoleError } from './useInvalidRoleError'

interface InvalidRoleErrorProps {
  detectedRole: string
  userEmail?: string
  // ❌ ELIMINADO: validRoles (información sensible)
}

export function InvalidRoleError({
  detectedRole,
  userEmail
}: InvalidRoleErrorProps) {
  // ✅ Lógica extraída a hook personalizado
  const { mounted, handleSignOut, handleRefresh, logoHorizontal, logoCircular } = useInvalidRoleError()

  // Mientras carga, mostrar spinner
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full"
      >
        {/* Logo Horizontal - Arriba (Responsive) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-4 sm:mb-6"
        >
          <Image
            src={logoHorizontal}
            alt="RyR Constructora"
            width={220}
            height={66}
            className="h-auto w-40 sm:w-[220px]"
            priority
          />
        </motion.div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-800 overflow-hidden">
          {/* Header con Gradiente (Responsive) */}
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-4 sm:p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Acceso Restringido</h1>
                <p className="text-red-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Tu cuenta no tiene autorización para acceder
                </p>
              </div>
            </div>
          </div>

          {/* Contenido (Responsive) */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Información del Error - SIN DETALLES SENSIBLES */}
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-red-900 dark:text-red-100">
                    Acceso No Autorizado
                  </h3>
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p>
                      Tu cuenta no tiene permisos válidos para acceder a este sistema.
                      Por favor, contacta al administrador para resolver este problema.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de Ayuda - SIN INFORMACIÓN DEL SISTEMA */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                    ¿Qué puedes hacer?
                  </h3>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                    <li>Contacta al administrador del sistema</li>
                    <li>Verifica que tu cuenta esté activa y correctamente configurada</li>
                    <li>Cierra sesión e intenta con otra cuenta</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Acciones (Responsive) */}
            <div className="flex flex-col gap-3 pt-3 sm:pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                Reintentar
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer con Logo Circular (Responsive) */}
        <div className="mt-6 sm:mt-8 text-center space-y-2 sm:space-y-3">
          <div className="flex justify-center mb-1 sm:mb-2">
            <Image
              src={logoCircular}
              alt="RyR"
              width={48}
              height={48}
              className="opacity-60 w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            Sistema de Gestión Integral
          </p>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@constructoraryr.com"
              className="text-red-600 dark:text-red-400 hover:underline font-semibold"
            >
              Contacta a Soporte Técnico
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
