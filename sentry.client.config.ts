/**
 * Sentry Client Configuration
 * Runs in the browser — captures unhandled errors and React component errors.
 */
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Porcentaje de transacciones a capturar para performance monitoring
  // 0.1 = 10% en producción para no disparar billing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Solo enviar errores en producción (no en desarrollo local)
  enabled: process.env.NODE_ENV === 'production',

  // No capturar errores de chunks de Next.js (fragmentos de código)
  // que se descartan cuando el usuario actualiza la página
  ignoreErrors: [
    'ChunkLoadError',
    'Loading chunk',
    'Loading CSS chunk',
    /hydrat/i, // Ignorar errores de hidratación de React (ya manejados por React)
  ],

  environment: process.env.NODE_ENV,
})
