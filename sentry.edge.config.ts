/**
 * Sentry Edge Configuration
 * Runs in Next.js middleware and Edge API routes.
 */
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,
})
