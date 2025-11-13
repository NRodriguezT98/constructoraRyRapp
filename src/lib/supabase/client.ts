import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './database.types'

// ⚠️ IMPORTANTE: Fallback para cuando env vars no están disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swyjhwgvkfcfdtemkyad.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

// ============================================
// CONFIGURACIÓN CON @supabase/ssr
// ============================================
// Usa createBrowserClient de @supabase/ssr
// Esto permite que el cliente y el middleware compartan
// la misma sesión vía cookies
//
// PKCE se usa AUTOMÁTICAMENTE para:
// - resetPasswordForEmail()
// - signInWithOAuth()
//
// Password-based auth para signInWithPassword()
// ============================================

// Cliente Supabase singleton para el navegador
const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    // ⚡ OPTIMIZACIONES DE DESARROLLO
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',

      // ⚡ Reducir frecuencia de refresh (menos overhead)
      debug: process.env.NODE_ENV === 'development' ? false : false,
    },

    // ⚡ Configuración de requests
    global: {
      headers: {
        'x-application-name': 'constructora-ryr',
      },
    },

    // ⚡ Configuración de cache para desarrollo
    db: {
      schema: 'public',
    },

    // ⚡ Configuración de realtime (desactivar si no usas)
    realtime: {
      params: {
        eventsPerSecond: 2, // Reducir frecuencia de eventos
      },
    },
  }
)

// Exportar función createClient para compatibilidad
export function createClient() {
  return supabase
}

// Exportar también el cliente directamente para uso legacy
export { supabase }
