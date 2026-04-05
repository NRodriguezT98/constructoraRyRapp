import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './database.types'
import { supabaseAnonKey, supabaseUrl } from './env'

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

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return client
}

// Exportar también el cliente directamente para uso legacy
export const supabase = createClient()
