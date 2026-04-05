/**
 * Script para eliminar el campo es_documento_identidad de la base de datos
 * Ejecutar: node scripts/eliminar-campo-db.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('Asegúrate de tener en .env.local:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function eliminarCampo() {
  console.log('🔍 Verificando si existe la columna es_documento_identidad...\n')

  // 1. Verificar si existe la columna
  const { data: columnas, error: errorCheck } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'documentos_cliente'
        AND column_name = 'es_documento_identidad'
    `,
  })

  if (errorCheck) {
    // Si no existe la función exec_sql, usar query directa
    console.log('⚠️  No se puede usar RPC, intentando con SQL directo...\n')

    const sqlScript = `
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'documentos_cliente'
            AND column_name = 'es_documento_identidad'
        ) THEN
          -- Eliminar el índice si existe
          DROP INDEX IF EXISTS idx_documentos_cliente_cedula;

          -- Eliminar la columna
          ALTER TABLE documentos_cliente
          DROP COLUMN es_documento_identidad;

          RAISE NOTICE 'Columna eliminada exitosamente.';
        ELSE
          RAISE NOTICE 'La columna NO EXISTE. No hay nada que eliminar.';
        END IF;
      END $$;
    `

    console.log('📝 Ejecutando script SQL...\n')
    console.log(
      '⚠️  IMPORTANTE: Este script requiere acceso directo a la base de datos.'
    )
    console.log(
      'Por favor, ejecuta el siguiente SQL en el Dashboard de Supabase:\n'
    )
    console.log('='.repeat(80))
    console.log(sqlScript)
    console.log('='.repeat(80))
    console.log(
      '\n📍 Dashboard de Supabase → SQL Editor → Pega el script → RUN\n'
    )

    return
  }

  // Si llegamos aquí, podemos ejecutar SQL
  if (columnas && columnas.length > 0) {
    console.log('✅ La columna existe. Eliminándola...\n')

    // Eliminar índice
    const { error: errorIndex } = await supabase.rpc('exec_sql', {
      sql: 'DROP INDEX IF EXISTS idx_documentos_cliente_cedula',
    })

    if (errorIndex) {
      console.log(
        '⚠️  Error al eliminar índice (puede no existir):',
        errorIndex.message
      )
    }

    // Eliminar columna
    const { error: errorDrop } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE documentos_cliente DROP COLUMN IF EXISTS es_documento_identidad',
    })

    if (errorDrop) {
      console.error('❌ Error al eliminar columna:', errorDrop)
      process.exit(1)
    }

    console.log('✅ Columna eliminada exitosamente\n')
  } else {
    console.log('ℹ️  La columna NO existe. No hay nada que eliminar.\n')
  }

  // Mostrar esquema actual
  console.log('📋 Esquema actual de documentos_cliente:\n')
  const { data: esquema } = await supabase
    .from('documentos_cliente')
    .select('*')
    .limit(0)

  if (esquema !== null) {
    console.log('✅ Tabla accesible. Esquema actualizado correctamente.\n')
  }

  console.log('🎉 Proceso completado!')
  console.log('\n📝 Próximos pasos:')
  console.log('  1. Reinicia el servidor de desarrollo (Ctrl+C y npm run dev)')
  console.log('  2. Intenta subir un documento')
  console.log('  3. Debería funcionar sin errores ✅\n')
}

eliminarCampo().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
