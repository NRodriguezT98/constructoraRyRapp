/**
 * ============================================
 * SUPABASE ADMIN CLIENT
 * ============================================
 *
 * Cliente de Supabase con SERVICE_ROLE_KEY.
 * BYPASEA RLS - Solo usar en server-side.
 *
 * CASOS DE USO:
 * - Actualizar user metadata (JWT)
 * - Operaciones administrativas
 * - Sign out global de usuarios
 *
 * ⚠️ NUNCA exponer en cliente
 */

import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * Cliente Admin de Supabase
 * ⚠️ Solo usar en server-side (API routes, server components, middleware)
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Verificar que el cliente admin está configurado correctamente
 */
export function isAdminClientReady(): boolean {
  return !!supabaseUrl && !!supabaseServiceRoleKey
}
