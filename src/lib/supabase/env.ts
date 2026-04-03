/**
 * Validación de variables de entorno de Supabase.
 * Centraliza la lectura y validación para client, server y middleware.
 *
 * NOTA: Se usan accesos estáticos (process.env.NEXT_PUBLIC_*) porque Next.js/Turbopack
 * solo puede inline variables NEXT_PUBLIC_ con acceso estático, no con bracket notation.
 */

const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const _supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!_supabaseUrl) {
  throw new Error(
    'Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL.\n' +
      'Configura las variables en .env.local. Consulta .env.example para referencia.'
  )
}

if (!_supabaseAnonKey) {
  throw new Error(
    'Falta la variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
      'Configura las variables en .env.local. Consulta .env.example para referencia.'
  )
}

export const supabaseUrl: string = _supabaseUrl
export const supabaseAnonKey: string = _supabaseAnonKey
