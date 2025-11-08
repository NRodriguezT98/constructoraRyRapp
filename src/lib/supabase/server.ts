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

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
