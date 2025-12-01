/**
 * ============================================
 * SISTEMA DE LOGGING PROFESIONAL
 * ============================================
 *
 * Logging condicional basado en variables de entorno.
 * Solo logea en desarrollo o cuando DEBUG está habilitado.
 */

const IS_DEV = process.env.NODE_ENV === 'development'
const DEBUG_AUTH = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true'

/**
 * Log de debugging (solo en desarrollo con DEBUG_AUTH=true)
 * @param message - Mensaje a mostrar
 * @param data - Datos opcionales a mostrar
 */
export function debugLog(message: string, data?: any) {
  if (IS_DEV && DEBUG_AUTH) {
    if (data !== undefined) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  }
}

/**
 * Log de errores (siempre se muestra, pero limpio)
 * @param context - Contexto del error (ej: 'login', 'middleware')
 * @param error - Error capturado
 * @param additionalData - Datos adicionales opcionales
 */
export function errorLog(context: string, error: any, additionalData?: Record<string, any>) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || 'Error desconocido',
    stack: IS_DEV ? error?.stack : error?.stack?.substring(0, 200), // Stack completo solo en dev
    ...additionalData,
  }

  console.error(`[RYR ERROR - ${context.toUpperCase()}]`, errorInfo)

  // TODO: Aquí se puede integrar Sentry u otro servicio de monitoreo
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { tags: { context }, extra: additionalData })
  // }
}

/**
 * Log de información (solo en desarrollo)
 * @param message - Mensaje informativo
 */
export function infoLog(message: string) {
  if (IS_DEV) {
    console.info(`[RYR INFO]`, message)
  }
}

/**
 * Log de éxito (solo en desarrollo)
 * @param message - Mensaje de éxito
 */
export function successLog(message: string) {
  if (IS_DEV) {
    console.log(`✅ [RYR SUCCESS]`, message)
  }
}

/**
 * Log de advertencia (siempre se muestra)
 * @param message - Mensaje de advertencia
 */
export function warnLog(message: string, data?: any) {
  console.warn(`⚠️ [RYR WARNING]`, message, data || '')
}
