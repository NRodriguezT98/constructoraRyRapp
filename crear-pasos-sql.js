/**
 * Script para crear pasos de validación en fuentes de pago existentes
 * Ejecuta SQL directamente sin TypeScript
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 Iniciando creación de pasos para fuentes existentes...\n')

// SQL para crear pasos automáticamente
const sql = `
-- Crear pasos para fuentes existentes que NO tienen pasos
INSERT INTO pasos_fuente_pago (
  fuente_pago_id,
  tipo_fuente,
  tipo_documento_requerido,
  titulo,
  nivel_validacion,
  orden,
  completado
)
SELECT
  fp.id AS fuente_pago_id,
  fp.tipo AS tipo_fuente,
  config.tipo_documento AS tipo_documento_requerido,
  config.titulo,
  config.nivel_validacion,
  config.orden,
  false AS completado
FROM fuentes_pago fp
CROSS JOIN requisitos_fuentes_pago_config config
WHERE config.tipo_fuente = fp.tipo
  AND config.activo = true
  AND NOT EXISTS (
    SELECT 1
    FROM pasos_fuente_pago pfp
    WHERE pfp.fuente_pago_id = fp.id
  )
ORDER BY fp.id, config.orden;
`

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error('❌ Error ejecutando SQL:', error)
    process.exit(1)
  }

  console.log('✅ Pasos creados exitosamente')
  console.log('📊 Resultado:', data)

} catch (err) {
  console.error('❌ Error:', err)
  process.exit(1)
}
