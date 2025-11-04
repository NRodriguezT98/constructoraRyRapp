import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

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
  supabaseAnonKey
)

// Exportar función createClient para compatibilidad
export function createClient() {
  return supabase
}

// Exportar también el cliente directamente para uso legacy
export { supabase }
