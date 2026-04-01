/**
 * Validación de variables de entorno de Supabase.
 * Centraliza la lectura y validación para client, server y middleware.
 */

function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}.\n` +
      'Configura las variables en .env.local. Consulta .env.example para referencia.'
    )
  }
  return value
}

export const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL')
export const supabaseAnonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
