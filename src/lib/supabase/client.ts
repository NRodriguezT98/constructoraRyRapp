import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

// ============================================
// NOTA: Warning "Multiple GoTrueClient instances" en desarrollo
// ============================================
// Este warning aparece en desarrollo debido a Next.js hot-reload.
// No afecta funcionalidad y desaparece en producción.
// La instancia es singleton y funciona correctamente.
// ============================================

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'ryr-constructora-auth',
  },
})
