/**
 * ============================================
 * SUPABASE SERVER CLIENT
 * ============================================
 *
 * Cliente de Supabase optimizado para Server Components y Middleware.
 * Maneja cookies de forma segura en el servidor.
 */

import { createServerClient } from '@supabase/ssr'

import { cookies } from 'next/headers'

/**
 * Crear cliente Supabase para Server Components
 * Usa cookies de Next.js para mantener sesión
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  // ⚠️ IMPORTANTE: Fallback para cuando env vars no están disponibles en runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swyjhwgvkfcfdtemkyad.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Puede fallar en Server Components (solo lectura)
            // Esto es normal y esperado
          }
        },
      },
    }
  )
}
