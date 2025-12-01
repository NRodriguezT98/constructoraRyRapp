import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { NextRequest, NextResponse } from 'next/server'

/**
 * Cliente de Supabase para Middleware de Next.js
 * Maneja cookies correctamente en el contexto del middleware
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  /**
   * ⚠️ EDGE RUNTIME WORKAROUND - CREDENCIALES HARDCODEADAS
   *
   * CONTEXTO:
   * - Next.js Edge Runtime NO soporta process.env.NEXT_PUBLIC_* en middleware
   * - Las variables de entorno no están disponibles en tiempo de ejecución
   *
   * SOLUCIÓN:
   * - Hardcodear credenciales PÚBLICAS (son seguras de exponer)
   * - NEXT_PUBLIC_SUPABASE_ANON_KEY es una key pública por diseño
   * - El acceso real está protegido por RLS en Supabase
   *
   * REFERENCIAS:
   * - https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes#unsupported-apis
   * - https://supabase.com/docs/guides/auth/server-side/nextjs#creating-a-supabase-client
   *
   * ALTERNATIVAS EVALUADAS:
   * ❌ process.env - No disponible en Edge Runtime
   * ❌ import.meta.env - No soportado en Next.js
   * ✅ Hardcodear valores públicos - Solución oficial recomendada
   */
  const supabaseUrl = 'https://swyjhwgvkfcfdtemkyad.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}
