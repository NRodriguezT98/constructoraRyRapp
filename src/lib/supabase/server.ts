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

import { supabaseAnonKey, supabaseUrl } from './env'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
