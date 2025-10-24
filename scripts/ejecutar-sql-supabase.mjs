/**
 * Script simple para ejecutar SQL en Supabase
 * Ejecutar: node scripts/ejecutar-sql-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 Intentando eliminar columna es_documento_identidad...\n')

// SQL a ejecutar
const sql = `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documentos_cliente'
      AND column_name = 'es_documento_identidad'
  ) THEN
    DROP INDEX IF EXISTS idx_documentos_cliente_cedula;
    ALTER TABLE documentos_cliente DROP COLUMN es_documento_identidad;
    RAISE NOTICE 'Columna eliminada';
  ELSE
    RAISE NOTICE 'Columna no existe';
  END IF;
END $$;
`

console.log('⚠️  NOTA: Supabase no permite ejecutar DDL (ALTER TABLE, DROP COLUMN) desde el cliente.')
console.log('Necesitas ejecutar este SQL directamente en el Dashboard de Supabase.\n')
console.log('=' .repeat(80))
console.log(sql)
console.log('=' .repeat(80))
console.log('\n📍 Pasos:')
console.log('  1. Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql')
console.log('  2. Pega el SQL de arriba')
console.log('  3. Haz click en RUN')
console.log('  4. Reinicia el servidor de desarrollo\n')
