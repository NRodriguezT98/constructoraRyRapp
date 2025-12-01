import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './database.types'

// ⚠️ IMPORTANTE: Fallback para cuando env vars no están disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swyjhwgvkfcfdtemkyad.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTU4ODQsImV4cCI6MjA3NjAzMTg4NH0.v9daNgC7Eesupwatd4eDipCXeTh1onVwVsCSFxYy5xs'

// ============================================
// CLIENTE BROWSER CON SSR (COOKIES)
// ============================================
// ✅ Usa createBrowserClient de @supabase/ssr
// ✅ Maneja cookies automáticamente (compartidas con middleware/server)
// ✅ Compatible con Next.js App Router
// ✅ Persiste sesión entre recargas
// ============================================

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  // Singleton pattern: crear solo una instancia
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )

  return client
}

// Exportar también el cliente directamente para uso legacy
export const supabase = createClient()
