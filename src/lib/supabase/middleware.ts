import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { NextRequest, NextResponse } from 'next/server'

/**
 * Cliente de Supabase para Middleware de Next.js
 * Maneja cookies correctamente en el contexto del middleware
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  // ⚠️ IMPORTANTE: En middleware, NEXT_PUBLIC_ vars no están disponibles en runtime
  // Solución: Hardcodear las URLs públicas (son públicas de todos modos)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swyjhwgvkfcfdtemkyad.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

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
